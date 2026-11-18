import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request as Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import {
  AddCartItemDto,
  MergeCartDto,
  UpdateCartItemDto,
} from './dto/cart.dto';

/** Every route requires a JWT (global guard) and only touches the caller's cart. */
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Req() req: Request) {
    return this.cartService.get(this.userId(req));
  }

  @Post('items')
  add(@Req() req: Request, @Body() body: AddCartItemDto) {
    return this.cartService.add(this.userId(req), body);
  }

  @Post('merge')
  merge(@Req() req: Request, @Body() body: MergeCartDto) {
    return this.cartService.merge(this.userId(req), body.items);
  }

  @Patch('items/:variantId')
  update(
    @Req() req: Request,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.cartService.setQuantity(
      this.userId(req),
      variantId,
      body.quantity,
    );
  }

  @Delete('items/:variantId')
  remove(
    @Req() req: Request,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.cartService.remove(this.userId(req), variantId);
  }

  @Delete()
  clear(@Req() req: Request) {
    return this.cartService.clear(this.userId(req));
  }

  private userId(req: Request) {
    return (req.user as { userId: string }).userId;
  }
}
