import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { ListCustomersDto } from './dto/list-customers.dto';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.Admin)
  @Get('admin')
  listCustomers(@Query() query: ListCustomersDto) {
    return this.userService.listCustomers(query);
  }
}
