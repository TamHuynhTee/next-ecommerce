import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { AddressService } from './address.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
} from './dto/account.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Roles(Role.Admin)
  @Get('admin')
  listCustomers(@Query() query: ListCustomersDto) {
    return this.userService.listCustomers(query);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return this.userService.getProfile(this.userId(req));
  }

  @Patch('me')
  updateMe(@Req() req: Request, @Body() body: UpdateProfileDto) {
    return this.userService.updateProfile(this.userId(req), body);
  }

  @Get('me/addresses')
  listAddresses(@Req() req: Request) {
    return this.addressService.list(this.userId(req));
  }

  @Post('me/addresses')
  createAddress(@Req() req: Request, @Body() body: CreateAddressDto) {
    return this.addressService.create(this.userId(req), body);
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAddressDto,
  ) {
    return this.addressService.update(this.userId(req), id, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('me/addresses/:id')
  async removeAddress(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.addressService.remove(this.userId(req), id);
  }

  private userId(req: Request) {
    return (req.user as { userId: string }).userId;
  }
}
