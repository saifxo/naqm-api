import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { assign, omit } from 'lodash';
import { ObjectId } from 'mongodb';
import { UserRepository } from '../../repository/user.repository';
import { AUTH_MESSAGES } from './auth.message';
import { AuthDto } from './dto/auth.dto';
import { LogInDto } from './dto/user-login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SignupDto } from './dto/user-signup.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { ROLE, STATUS } from 'src/shared/constants';
import { NaqmRequest } from 'src/shared/models';

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    private userRepo: UserRepository,
    private configService: ConfigService,
  ) {}

  matchRole(actual, should) {
    return actual === should;
  }

  checkRoles(user, current: ROLE) {
    if (user.status !== STATUS.ACTIVE) {
      throw new HttpException(AUTH_MESSAGES.INACTIVE, HttpStatus.UNAUTHORIZED);
    }
    if (this.matchRole(user.role, current)) {
      delete user.password;
      return user;
    }
    throw new HttpException(
      AUTH_MESSAGES.ROLE_INVALID,
      HttpStatus.UNAUTHORIZED,
    );
  }

  async validate(payload: LogInDto): Promise<any> {
    const user = await this.userRepo.findOneBy({
      where: {
        email: payload.email,
        status: { $nin: [STATUS.BANNED] },
      },
    });
    if (user) {
      const matched = await bcrypt.compare(payload.password, user.password);
      if (matched) {
        delete user.password;
        return user;
      }
      return null;
    }
    return null;
  }

  async checkIfUnique(key = 'email', value, thrw = false): Promise<User[]> {
    let cond: any = {};
    cond[key] = value;
    const results = await this.userRepo.find({
      where: { $or: [cond, { username: value }] },
    });
    if (results.length > 0 && thrw) {
      throw new HttpException(
        AUTH_MESSAGES[`${key.toUpperCase()}_EXIST`],
        HttpStatus.CONFLICT,
      );
    }
    return results;
  }

  async signup(data: SignupDto) {
    let otpVerified = true;
    if (otpVerified) {
      const onboarded = await this.userRepo.onboard({ ...data });
      if (onboarded) {
        return this.login({
          email: onboarded.email,
          password: data.password,
        });
      }
    }
    throw new HttpException(AUTH_MESSAGES.INVALID_OTP, HttpStatus.BAD_REQUEST);
  }

  async createTokens(payload: any) {
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('TOKEN_EXPIRES_IN') || '2d',
      }),
      refresh_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get('TOKEN_EXPIRES_IN_REFRESH') || '15d',
      }),
    };
  }

  async login(payload: LogInDto) {
    let user;
    user = await this.validate(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    const jwtPayload = {
      username: user.username,
      name: user.name,
      verified: user.verified,
      identifier: user.identifier,
      avatar: user.avatar,
      bg_avatar: user.bg_avatar,
      sub: user.id,
      role: user.role,
    };
    return await this.createTokens(jwtPayload);
  }

  async refreshToken(payload: any) {
    try {
      const decoded = await this.jwtService.verifyAsync(payload.refresh_token);
      console.log(decoded);
      const user = await this.userRepo.findOne({
        where: { _id: new ObjectId(decoded.sub) },
      });
      if (user) {
        const jwtPayload = {
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          sub: user.id,
          role: user.role,
        };
        return {
          access_token: this.jwtService.sign(jwtPayload, {
            expiresIn: this.configService.get('TOKEN_EXPIRES_IN') || '2d',
          }),
        };
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async logout(req: any) {
    const user = await this.userRepo.findOne({
      where: { _id: new ObjectId(req.user.id) },
    });
    if (user) {
      this.userRepo.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $unset: { notification_token: 1 } },
      );
      return true;
    }
    throw new UnauthorizedException();
  }

  profile(req: NaqmRequest) {
    return this.userRepo.findOne({ where: { _id: req.user.id } });
  }

  async update(req, payload: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { _id: new ObjectId(req.user.id) },
    });
    if (user && user._id) {
      assign(user, omit(payload, ['role']));
      await this.userRepo.save(user);
      return { message: AUTH_MESSAGES.PROFILE_UPDATED };
    }
    throw new HttpException(AUTH_MESSAGES.NOT_FOUND, HttpStatus.BAD_REQUEST);
  }
}
