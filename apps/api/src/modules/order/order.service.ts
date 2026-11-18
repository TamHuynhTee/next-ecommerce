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
import { Payment } from './entities/payment.entity';

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

  async listAll({ page = 1, limit = 10, status }: ListOrdersDto) {
    const [orders, total] = await this.dataSource
      .getRepository(OrderDetail)
      .findAndCount({
        where: status ? { status } : {},
        relations: RELATIONS,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
    return { items: orders.map((o) => this.toView(o)), total, page, limit };
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
