import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductStatus } from '../products/entities/product/product.entity';
import { CreateOrderDto } from './dto/order.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderDetail, OrderDetailStatus } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { OrderService } from './order.service';

// @nestjs/typeorm is ESM-only; only its injection decorator is needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectDataSource: () => () => undefined,
}));

const USER = 'u1';
const DTO: CreateOrderDto = {
  firstName: 'An',
  lastName: 'Nguyen',
  phone: '0901234567',
  email: 'an@example.com',
  addressLine1: '1 Le Loi',
  city: 'Ho Chi Minh',
  postalCode: '70000',
};

type Stored = {
  id: string;
  unitPrice: string;
  stock: number;
  isActive?: boolean;
  status?: ProductStatus;
  quantity: number;
};

/** In-memory stand-in for the entity manager, enough for the order flow. */
function setup(rows: Stored[]) {
  const saved: unknown[] = [];
  const stock = new Map(rows.map((r) => [r.id, r.stock]));
  let deletedCart = false;

  const cartItems = rows.map((r) => ({
    productVariantId: r.id,
    quantity: r.quantity,
    productVariant: {
      product: {
        name: 'Tee',
        slug: 'tee',
        status: r.status ?? ProductStatus.ACTIVE,
      },
    },
  }));

  const manager = {
    find: jest.fn(async (entity: unknown) => {
      if (entity === OrderItem) return [];
      if (
        cartItems.length &&
        (entity as { name: string }).name === 'CartItem'
      ) {
        return cartItems;
      }
      return rows.map((r) => ({
        id: r.id,
        sku: `sku-${r.id}`,
        name: null,
        unitPrice: r.unitPrice,
        originalPrice: null,
        currency: 'VND',
        stock: stock.get(r.id),
        isActive: r.isActive ?? true,
      }));
    }),
    save: jest.fn(async (value: { id?: string }) => {
      saved.push(value);
      return { ...value, id: value.id ?? 'order-1' };
    }),
    update: jest.fn(
      async (_e: unknown, id: string, patch: { stock: number }) => {
        stock.set(id, patch.stock);
      },
    ),
    delete: jest.fn(async () => {
      deletedCart = true;
    }),
  };

  const dataSource = {
    transaction: jest.fn(async (fn: (m: unknown) => unknown) => fn(manager)),
    getRepository: jest.fn(() => ({
      findOne: jest.fn(async () => ({
        id: 'order-1',
        status: OrderDetailStatus.PENDING,
        currency: 'VND',
        totalAmount: '0',
        items: [],
        payment: null,
      })),
    })),
  };
  const service = new OrderService(dataSource as unknown as DataSource);
  return { service, saved, stock, manager, wasCartCleared: () => deletedCart };
}

describe('OrderService.create', () => {
  it('snapshots prices, adds shipping below the free threshold, takes stock and empties the cart', async () => {
    const { service, saved, stock, wasCartCleared } = setup([
      { id: 'v1', unitPrice: '100000', stock: 5, quantity: 2 },
    ]);
    await service.create(USER, DTO);

    const order = saved.find((s) => s instanceof OrderDetail) as OrderDetail;
    expect(order.totalAmount).toBe('230000'); // 200000 + 30000 shipping
    expect(order.customerCountry).toBe('VN');
    expect(order.items[0].lineTotal).toBe('200000');
    const payment = saved.find((s) => s instanceof Payment) as Payment;
    expect(payment).toMatchObject({ provider: 'cod', totalAmount: '230000' });
    expect(stock.get('v1')).toBe(3);
    expect(wasCartCleared()).toBe(true);
  });

  it('ships free from the threshold', async () => {
    const { service, saved } = setup([
      { id: 'v1', unitPrice: '250000', stock: 5, quantity: 2 },
    ]);
    await service.create(USER, DTO);
    const order = saved.find((s) => s instanceof OrderDetail) as OrderDetail;
    expect(order.totalAmount).toBe('500000');
  });

  it('reports which lines are short on stock and changes nothing', async () => {
    const { service, saved, stock } = setup([
      { id: 'v1', unitPrice: '100000', stock: 1, quantity: 3 },
    ]);
    const error = await service.create(USER, DTO).catch((e) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.getResponse()).toMatchObject({
      message: 'CART_INVALID',
      issues: [{ variantId: 'v1', reason: 'OUT_OF_STOCK', available: 1 }],
    });
    expect(saved).toEqual([]);
    expect(stock.get('v1')).toBe(1);
  });

  it('rejects products that are no longer on sale', async () => {
    const { service } = setup([
      {
        id: 'v1',
        unitPrice: '1',
        stock: 5,
        quantity: 1,
        status: ProductStatus.DRAFT,
      },
    ]);
    await expect(service.create(USER, DTO)).rejects.toMatchObject({
      response: { issues: [{ reason: 'UNAVAILABLE' }] },
    });
  });
});

describe('OrderService.findOne', () => {
  it('returns 404 when the order is not the caller’s', async () => {
    const service = new OrderService({
      getRepository: () => ({ findOne: async () => null }),
    } as unknown as DataSource);
    await expect(service.findOne(USER, 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('OrderService status changes', () => {
  const withOrder = (status: OrderDetailStatus) => {
    const restored: Array<[string, number]> = [];
    const order = { id: 'o1', userId: USER, status } as OrderDetail;
    const manager = {
      findOne: jest.fn(async () => order),
      find: jest.fn(async () => [
        { productVariantId: 'v1', quantity: 2 },
        { productVariantId: null, quantity: 1 },
      ]),
      increment: jest.fn(async (_e, where: { id: string }, _c, by: number) => {
        restored.push([where.id, by]);
      }),
      save: jest.fn(async (o) => o),
    };
    const service = new OrderService({
      transaction: async (fn: (m: unknown) => unknown) => fn(manager),
      getRepository: () => ({ findOne: async () => order }),
    } as unknown as DataSource);
    return { service, order, restored };
  };

  it('puts items back in stock when a pending order is cancelled', async () => {
    const { service, order, restored } = withOrder(OrderDetailStatus.PENDING);
    await service.cancel(USER, 'o1');
    expect(order.status).toBe(OrderDetailStatus.CANCELLED);
    expect(restored).toEqual([['v1', 2]]);
  });

  it('refuses to cancel an order that already shipped', async () => {
    const { service } = withOrder(OrderDetailStatus.SHIPPED);
    await expect(service.cancel(USER, 'o1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('only allows valid admin transitions', async () => {
    const { service } = withOrder(OrderDetailStatus.PENDING);
    await expect(
      service.updateStatus('o1', OrderDetailStatus.DELIVERED),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.updateStatus('o1', OrderDetailStatus.CONFIRMED),
    ).resolves.toBeDefined();
  });
});
