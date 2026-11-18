import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { User } from './entities/user.entity';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService, AddressService],
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    forwardRef(() => AuthModule),
  ],
  exports: [UserService],
})
export class UserModule {}
