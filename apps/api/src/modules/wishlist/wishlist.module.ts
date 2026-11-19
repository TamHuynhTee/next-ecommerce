import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from '../products/entities/product/product-variant.entity';
import { Wishlist } from '../users/entities/wishlist.entity';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService],
  imports: [TypeOrmModule.forFeature([Wishlist, ProductVariant])],
})
export class WishlistModule {}
