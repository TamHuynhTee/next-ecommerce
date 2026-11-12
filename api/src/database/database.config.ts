import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { User } from 'src/modules/users/entities/user.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { OrderItem } from '../modules/order/entities/order-item.entity';
import { OrderDetail } from '../modules/order/entities/order.entity';
import { Payment } from '../modules/order/entities/payment.entity';
import { Category } from '../modules/products/entities/category/category.entity';
import { SubCategory } from '../modules/products/entities/category/sub-category.entity';
import { ProductVariant } from '../modules/products/entities/product/product-variant.entity';
import { Product } from '../modules/products/entities/product/product.entity';
import { Address } from '../modules/users/entities/address.entity';
import { Wishlist } from '../modules/users/entities/wishlist.entity';
import { AppNamingStrategy } from './naming-strategy';

export function createDatabaseOptions(
  config: ConfigService,
): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
  return {
    type: 'postgres',
    entities: [
      User,
      Address,
      Wishlist,
      Category,
      SubCategory,
      Product,
      ProductVariant,
      CartItem,
      OrderDetail,
      OrderItem,
      Payment,
    ],
    synchronize: false,
    migrationsRun: false,
    dropSchema: false,
    migrations: [
      join(
        __dirname,
        'migrations',
        __filename.endsWith('.ts') ? '*.ts' : '*.js',
      ),
    ],
    migrationsTableName: 'schema_migrations',
    migrationsTransactionMode: 'all',
    namingStrategy: new AppNamingStrategy(),
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
  };
}
