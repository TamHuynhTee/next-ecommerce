import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request as Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './services/products.service';

/** Public routes are reachable anonymously; only admins may see unpublished products. */
const isAdmin = (req: Request) =>
  (req.user as { role?: Role } | undefined)?.role === Role.Admin;

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Public()
  @Get()
  findAll(@Query() query: ListProductsDto, @Req() req: Request) {
    return this.productsService.findAll(query, isAdmin(req));
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    return this.productsService.findBySlug(slug, isAdmin(req));
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.productsService.findOne(id, isAdmin(req));
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Roles(Role.Admin)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
