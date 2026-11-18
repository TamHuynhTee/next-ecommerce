import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { shippingFeeFor } from 'src/common/utils/shipping';
import { DataSource, EntityManager, In } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product/product-variant.entity';
import { ProductStatus } from '../products/entities/product/product.entity';
import { CreateOrderDto, ListOrdersDto } from './dto/order.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderDetail, OrderDetailStatus } from './entities/order.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';

const PAYMENT_PROVIDER_COD = 'cod';
const DEFAULT_COUNTRY = 'VN';

const NEXT_STATUSES: Record<OrderDetailStatus, OrderDetailStatus[]> = {
  [OrderDetailStatus.PENDING]: [
    OrderDetailStatus.CONFIRMED,
    OrderDetailStatus.CANCELLED,
  ],
  [OrderDetailStatus.CONFIRMED]: [
    OrderDetailStatus.SHIPPED,
    OrderDetailStatus.CANCELLED,
  ],
  [OrderDetailStatus.SHIPPED]: [OrderDetailStatus.DELIVERED],
  [OrderDetailStatus.DELIVERED]: [],
  [OrderDetailStatus.CANCELLED]: [],
};

/** Escapes LIKE wildcards so user input is matched literally. */
function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Parses a YYYY-MM-DD string as a UTC date, so day arithmetic ignores local time zones. */
const parseDay = (day: string) => new Date(`${day}T00:00:00Z`);

/** The 30 days ending on `today` (YYYY-MM-DD), with zero for days without sales. */
export function fillDays(
  rows: Array<{ day: string; revenue: string }>,
  today: string,
) {
  const byDay = new Map(rows.map((r) => [r.day, Number(r.revenue)]));
  return Array.from({ length: 30 }, (_, i) => {
    const d = parseDay(today);
    d.setUTCDate(d.getUTCDate() - (29 - i));
    const day = isoDay(d);
    return { day, revenue: byDay.get(day) ?? 0 };
  });
}

/** The 12 months ending with the month of `today`, with zero for quiet months. */
export function fillMonths(
  rows: Array<{ month: string; revenue: string }>,
  today: string,
) {
  const byMonth = new Map(rows.map((r) => [r.month, Number(r.revenue)]));
  const base = parseDay(today);
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - (11 - i), 1),
    );
    const month = isoDay(d).slice(0, 7);
    return { month, revenue: byMonth.get(month) ?? 0 };
  });
}

export type CartIssue = {
  variantId: string;
  title: string;
  reason: 'UNAVAILABLE' | 'OUT_OF_STOCK';
  available: number;
};

const RELATIONS = {
  items: { productVariant: true },
  payment: true,
} as const;

@Injectable()
export class OrderService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Turns the user's cart into an order inside one transaction: variants are
   * locked so concurrent checkouts cannot oversell, prices are snapshotted
   * from the catalog and the cart is emptied.
   */
  async create(userId: string, dto: CreateOrderDto) {
    const orderId = await this.dataSource.transaction(async (manager) => {
      const cartItems = await manager.find(CartItem, {
        where: { userId },
        relations: { productVariant: { product: true } },
        order: { createdAt: 'ASC' },
      });
      if (cartItems.length === 0) {
        throw new BadRequestException(ERROR_CODE.CART_EMPTY);
      }

      const locked = await manager.find(ProductVariant, {
        where: { id: In(cartItems.map((c) => c.productVariantId)) },
        lock: { mode: 'pessimistic_write' },
      });
      const fresh = new Map(locked.map((v) => [v.id, v]));

      const issues: CartIssue[] = [];
      const lines = cartItems.flatMap((cartItem) => {
        const variant = fresh.get(cartItem.productVariantId);
        const product = cartItem.productVariant?.product;
        const title = product?.name ?? cartItem.productVariantId;
        if (
          !variant ||
          !variant.isActive ||
          product?.status !== ProductStatus.ACTIVE
        ) {
          issues.push({
            variantId: cartItem.productVariantId,
            title,
            reason: 'UNAVAILABLE',
            available: 0,
          });
          return [];
        }
        if (variant.stock < cartItem.quantity) {
          issues.push({
            variantId: variant.id,
            title,
            reason: 'OUT_OF_STOCK',
            available: variant.stock,
          });
          return [];
        }
        return [{ cartItem, variant, product }];
      });
      if (issues.length > 0) {
        throw new BadRequestException({
          message: ERROR_CODE.CART_INVALID,
          issues,
        });
      }

      const currencies = new Set(lines.map((l) => l.variant.currency));
      if (currencies.size > 1) {
        throw new BadRequestException(ERROR_CODE.MIXED_CURRENCY);
      }

      const items = lines.map(({ cartItem, variant, product }) => {
        const unit = BigInt(variant.unitPrice);
        return new OrderItem({
          productVariantId: variant.id,
          productName: variant.name
            ? `${product.name} - ${variant.name}`
            : product.name,
          productSlug: product.slug,
          productSku: variant.sku,
          productUnitPrice: unit.toString(),
          productOriginalPrice: variant.originalPrice,
          currency: variant.currency,
          quantity: cartItem.quantity,
          lineTotal: (unit * BigInt(cartItem.quantity)).toString(),
        });
      });
      const subtotal = items.reduce((sum, i) => sum + BigInt(i.lineTotal), 0n);
      const total = subtotal + BigInt(shippingFeeFor(Number(subtotal)));
      const currency = lines[0].variant.currency;

      const order = await manager.save(
        new OrderDetail({
          userId,
          currency,
          totalAmount: total.toString(),
          customerFirstName: dto.firstName,
          customerLastName: dto.lastName,
          customerPhoneNumber: dto.phone,
          customerEmail: dto.email,
          customerAddressLine1: dto.addressLine1,
          customerAddressLine2: dto.addressLine2 ?? null,
          customerCity: dto.city,
          customerPostalCode: dto.postalCode,
          customerCountry: dto.country ?? DEFAULT_COUNTRY,
          items,
        }),
      );
      await manager.save(
        new Payment({
          orderId: order.id,
          totalAmount: total.toString(),
          currency,
          provider: PAYMENT_PROVIDER_COD,
        }),
      );

      for (const { cartItem, variant } of lines) {
        await manager.update(ProductVariant, variant.id, {
          stock: variant.stock - cartItem.quantity,
        });
      }
      await manager.delete(CartItem, { userId });
      return order.id;
    });

    return this.findOne(userId, orderId);
  }

  async list(userId: string, { page = 1, limit = 10 }: ListOrdersDto) {
    const [orders, total] = await this.dataSource
      .getRepository(OrderDetail)
      .findAndCount({
        where: { userId },
        relations: RELATIONS,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    return { items: orders.map((o) => this.toView(o)), total, page, limit };
  }

  async listAll({ page = 1, limit = 10, status, q }: ListOrdersDto) {
    const qb = this.dataSource
      .getRepository(OrderDetail)
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'i')
      .leftJoinAndSelect('i.productVariant', 'v')
      .leftJoinAndSelect('o.payment', 'p')
      .orderBy('o.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (status) qb.andWhere('o.status = :status', { status });
    const term = q?.trim();
    if (term) {
      qb.andWhere(
        `(CAST(o.id AS text) ILIKE :q
          OR o.customerEmail ILIKE :q
          OR CONCAT(o.customerFirstName, ' ', o.customerLastName) ILIKE :q)`,
        { q: `%${escapeLike(term)}%` },
      );
    }
    const [orders, total] = await qb.getManyAndCount();
    return { items: orders.map((o) => this.toView(o)), total, page, limit };
  }

  /** Any order, for the back office. */
  async findOneAsAdmin(id: string) {
    const order = await this.dataSource
      .getRepository(OrderDetail)
      .findOne({ where: { id }, relations: RELATIONS });
    if (!order) throw new NotFoundException(ERROR_CODE.ORDER_NOT_FOUND);
    return this.toView(order);
  }

  /** Revenue figures ignore cancelled orders. */
  async stats() {
    const run = <T>(sql: string, params: unknown[] = []) =>
      this.dataSource.query(sql, params) as Promise<T[]>;

    // Day and month buckets use the database clock, the same one that stamped created_at.
    const [{ today }] = await run<{ today: string }>(
      `SELECT to_char(now(), 'YYYY-MM-DD') AS today`,
    );
    const [month] = await run<{ revenue: string; orders: string }>(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*) AS orders
         FROM order_details
        WHERE status <> 'cancelled'
          AND created_at >= date_trunc('month', now())`,
    );
    const [pending] = await run<{ count: string }>(
      `SELECT COUNT(*) AS count FROM order_details WHERE status = 'pending'`,
    );
    const [customers] = await run<{ count: string }>(
      `SELECT COUNT(*) AS count FROM users
        WHERE role = 'user' AND created_at >= now() - interval '30 days'`,
    );
    const daily = await run<{ day: string; revenue: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
              SUM(total_amount) AS revenue
         FROM order_details
        WHERE status <> 'cancelled'
          AND created_at >= date_trunc('day', now()) - interval '29 days'
        GROUP BY 1`,
    );
    const monthly = await run<{ month: string; revenue: string }>(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
              SUM(total_amount) AS revenue
         FROM order_details
        WHERE status <> 'cancelled'
          AND created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY 1`,
    );
    const byStatus = await run<{ status: OrderDetailStatus; count: string }>(
      `SELECT status, COUNT(*) AS count FROM order_details GROUP BY status`,
    );

    return {
      monthRevenue: Number(month.revenue),
      monthOrders: Number(month.orders),
      pendingOrders: Number(pending.count),
      newCustomers: Number(customers.count),
      daily: fillDays(daily, today),
      monthly: fillMonths(monthly, today),
      byStatus: Object.values(OrderDetailStatus).map((status) => ({
        status,
        count: Number(byStatus.find((r) => r.status === status)?.count ?? 0),
      })),
    };
  }

  /** Owners only: other users get the same 404 as a missing order. */
  async findOne(userId: string, id: string) {
    const order = await this.dataSource
      .getRepository(OrderDetail)
      .findOne({ where: { id, userId }, relations: RELATIONS });
    if (!order) throw new NotFoundException(ERROR_CODE.ORDER_NOT_FOUND);
    return this.toView(order);
  }

  async cancel(userId: string, id: string) {
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderDetail, {
        where: { id, userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException(ERROR_CODE.ORDER_NOT_FOUND);
      if (order.status !== OrderDetailStatus.PENDING) {
        throw new BadRequestException(ERROR_CODE.ORDER_NOT_CANCELLABLE);
      }
      await this.markCancelled(manager, order);
    });
    return this.findOne(userId, id);
  }

  async updateStatus(id: string, status: OrderDetailStatus) {
    const userId = await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(OrderDetail, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException(ERROR_CODE.ORDER_NOT_FOUND);
      if (!NEXT_STATUSES[order.status].includes(status)) {
        throw new BadRequestException(ERROR_CODE.INVALID_STATUS_TRANSITION);
      }
      if (status === OrderDetailStatus.CANCELLED) {
        await this.markCancelled(manager, order);
      } else {
        order.status = status;
        await manager.save(order);
        if (status === OrderDetailStatus.DELIVERED) {
          // Cash on delivery: the money is collected when the parcel arrives.
          await manager.update(
            Payment,
            { orderId: order.id },
            { status: PaymentStatus.SUCCEEDED },
          );
        }
      }
      return order.userId;
    });
    return this.findOne(userId, id);
  }

  /** Cancels an order and puts its items back in stock. */
  private async markCancelled(manager: EntityManager, order: OrderDetail) {
    const items = await manager.find(OrderItem, {
      where: { orderId: order.id },
    });
    for (const item of items) {
      if (item.productVariantId) {
        await manager.increment(
          ProductVariant,
          { id: item.productVariantId },
          'stock',
          item.quantity,
        );
      }
    }
    order.status = OrderDetailStatus.CANCELLED;
    await manager.save(order);
  }

  private toView(order: OrderDetail) {
    const items = (order.items ?? []).map((item) => ({
      variantId: item.productVariantId,
      name: item.productName,
      slug: item.productSlug,
      sku: item.productSku,
      unitPrice: Number(item.productUnitPrice),
      originalPrice: item.productOriginalPrice
        ? Number(item.productOriginalPrice)
        : Number(item.productUnitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
      imageUrl: item.productVariant?.imageUrl ?? null,
    }));
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const total = Number(order.totalAmount);
    return {
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      currency: order.currency,
      subtotal,
      shippingFee: total - subtotal,
      total,
      customer: {
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        phone: order.customerPhoneNumber,
        email: order.customerEmail,
        addressLine1: order.customerAddressLine1,
        addressLine2: order.customerAddressLine2,
        city: order.customerCity,
        postalCode: order.customerPostalCode,
        country: order.customerCountry,
      },
      payment: order.payment
        ? { provider: order.payment.provider, status: order.payment.status }
        : null,
      items,
    };
  }
}
