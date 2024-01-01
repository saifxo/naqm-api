import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt/dist';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserRepository } from 'src/repository/user.repository';

@Module({
  controllers: [AuthenticationController],
  providers: [
    UserRepository,
    AuthenticationService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Protecting all endpoints by default so that we don't have to use guard everywher
    },
  ],
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: `p8ck4x7tj2Hmu5Uf75ixmTu0H4rqITPCxroMlGYuknx9bk0LNarxyYJ72R2Fwhv`, //FIXME: process.env.SECRET,
      signOptions: { expiresIn: '3d' },
    }),
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
