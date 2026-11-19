import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request as Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AddWishlistItemDto, MergeWishlistDto } from './dto/wishlist.dto';
import { WishlistService } from './wishlist.service';

/** Every route requires a JWT and only touches the caller's wishlist. */
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  get(@Req() req: Request) {
    return this.wishlistService.get(this.userId(req));
  }

  @Post('items')
  add(@Req() req: Request, @Body() body: AddWishlistItemDto) {
    return this.wishlistService.add(this.userId(req), body.variantId);
  }

  @Post('merge')
  merge(@Req() req: Request, @Body() body: MergeWishlistDto) {
    return this.wishlistService.merge(this.userId(req), body.variantIds);
  }

  @Delete('items/:variantId')
  remove(
    @Req() req: Request,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ) {
    return this.wishlistService.remove(this.userId(req), variantId);
  }

  @Delete()
  clear(@Req() req: Request) {
    return this.wishlistService.clear(this.userId(req));
  }

  private userId(req: Request) {
    return (req.user as { userId: string }).userId;
  }
}
