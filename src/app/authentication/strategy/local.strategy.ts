import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LogInDto } from '../dto/user-login.dto';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({ passReqToCallback: true });
  }

  async validate(req: any, email: string, password: string): Promise<any> {
    const user = await this.authService.validate({
      email,
      password,
      role: req.body.role,
    } as LogInDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
