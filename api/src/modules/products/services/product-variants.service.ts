import { Injectable } from '@nestjs/common';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  create(createProductDto: CreateProductVariantDto) {
    return 'This action adds a new product variant';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
