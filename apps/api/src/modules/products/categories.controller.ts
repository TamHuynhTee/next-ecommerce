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
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { CategoriesService } from './services/categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Public()
  @Get('categories')
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get('categories/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Roles(Role.Admin)
  @Post('categories')
  create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Roles(Role.Admin)
  @Patch('categories/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles(Role.Admin)
  @HttpCode(204)
  @Delete('categories/:id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Roles(Role.Admin)
  @Post('categories/:id/sub-categories')
  createSub(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSubCategoryDto,
  ) {
    return this.service.createSub(id, dto);
  }

  @Roles(Role.Admin)
  @Patch('sub-categories/:id')
  updateSub(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubCategoryDto,
  ) {
    return this.service.updateSub(id, dto);
  }

  @Roles(Role.Admin)
  @HttpCode(204)
  @Delete('sub-categories/:id')
  removeSub(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeSub(id);
  }
}
