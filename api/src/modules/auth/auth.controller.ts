import {
  Body,
  Controller,
  Get,
  Post,
  Request as Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('sign-up')
  async signup(@Body() body: SignupDto): Promise<User> {
    return this.userService.create(body);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('sign-in')
  async signin(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
