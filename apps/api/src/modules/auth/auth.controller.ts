import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request as Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('sign-up')
  async signup(@Body() body: SignupDto) {
    // Issue a token right after registration so the user is authenticated immediately.
    const user = await this.userService.create(body);
    return this.authService.login(user);
  }

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('sign-in')
  async signin(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refresh_token);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('sign-out')
  async signOut(@Body() body: RefreshTokenDto) {
    await this.authService.signOut(body.refresh_token);
  }

  /** Lets the admin app verify, server-side, that the token belongs to an admin. */
  @Roles(Role.Admin)
  @Get('admin/me')
  getAdminProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
