import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';
import { CredentialService } from './credential.service';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/configuration';

@Module({
  controllers: [AuthController],
  providers: [AuthService, CredentialService, LocalStrategy, JwtStrategy],
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('jwt.secret_key', { infer: true }),
        signOptions: {
          expiresIn: config.get('jwt.expires_in', {
            infer: true,
          }) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  exports: [CredentialService],
})
export class AuthModule {}
