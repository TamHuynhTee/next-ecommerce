import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request as Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import {
  CreateOrderDto,
  ListOrdersDto,
  UpdateOrderStatusDto,
} from './dto/order.dto';
import { OrderService } from './order.service';

/** Every route requires a JWT; customers only ever touch their own orders. */
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Req() req: Request, @Body() body: CreateOrderDto) {
    return this.orderService.create(this.userId(req), body);
  }

  @Get()
  list(@Req() req: Request, @Query() query: ListOrdersDto) {
    return this.orderService.list(this.userId(req), query);
  }

  @Roles(Role.Admin)
  @Get('admin')
  listAll(@Query() query: ListOrdersDto) {
    return this.orderService.listAll(query);
  }

  @Roles(Role.Admin)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, body.status);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(this.userId(req), id);
  }

  @Post(':id/cancel')
  cancel(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.cancel(this.userId(req), id);
  }

  private userId(req: Request) {
    return (req.user as { userId: string }).userId;
  }
}
