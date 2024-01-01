import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { Public } from './decorators/is-public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SignupDto } from './dto/user-signup.dto';
import { LogInDto } from './dto/user-login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('signup')
  userSignup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() payload: LogInDto) {
    return this.authService.login(payload);
  }

  @Public()
  @Post('refresh-token')
  refreshToken(@Body() payload: any) {
    return this.authService.refreshToken(payload);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  async logout(@Request() req) {
    return this.authService.logout(req);
  }

  @Put('profile')
  @ApiBearerAuth('JWT-auth')
  profile(@Request() req, @Body() payload: UpdateProfileDto) {
    return this.authService.update(req, payload);
  }
}
