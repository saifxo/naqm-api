import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { omit, pick } from 'lodash';
import { ObjectId } from 'mongodb';
import { DataSource, MongoRepository } from 'typeorm';
import { map, uniq } from 'lodash';
// import { NotificationService } from '@shared/services/notification.service';
// import { NotificationTYPE } from '@shared/interfaces/Notification.interface';
import { ROLE, STATUS } from 'src/shared/constants';
import { User } from 'src/entities/user.entity';
import { SignupDto } from 'src/app/authentication/dto/user-signup.dto';
import { AUTH_MESSAGES } from 'src/app/authentication/auth.message';

@Injectable()
export class UserRepository extends MongoRepository<User> {
  constructor(
    private dataSource: DataSource,
    private configservice: ConfigService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async onboard(data: SignupDto) {
    const feilds = ['name', 'email', 'avatar', 'role'];
    const userPayload: Partial<User> = pick(data, feilds) as unknown as User;
    await this.verifyDuplication(data);
    await this.verifyIdetifierDuplication(data);
    userPayload.password = await bcrypt.hash(data.password, 10);
    userPayload.status = this.getSatus(data.role);
    userPayload.avatar = this.getAvatar(data);
    const userObj = this.create(userPayload);
    const user = await this.save(userObj);
    // userPayload.follower_count = 0;
    // userPayload.following_count = 0;
    // await this.addFollowing(user._id);
    return this.profile(user._id);
  }

  //   updateNotificationToken(id: ObjectId, token: string) {
  //     return this.update(id, { notification_token: token });
  //   }

  getSatus(role: ROLE) {
    return STATUS.ACTIVE;
  }

  async attachRel(user, rel: string[], role): Promise<User> {
    const promises = [];
    const userId = user._id;
    if (!rel || !userId) {
      return await new Promise(user);
    }
    return Promise.all(promises).then(() => user);
  }

  async profile(
    id: string | ObjectId,
    rel?: string[],
    role?: ROLE,
  ): Promise<User> {
    if (!id) {
      throw new HttpException(
        AUTH_MESSAGES.MISSING_USER_INFO,
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      id = typeof id === 'string' ? new ObjectId(id) : id;
      let user: Partial<User> = await this.findOne({ where: { _id: id } });
      user = omit(user, ['password']);
      return await this.attachRel(user, rel || [], role);
    } catch (e) {
      throw new HttpException(
        AUTH_MESSAGES.MISSING_USER_INFO,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async verifyDuplication(data: any) {
    let $or: any = [{ email: data.email }, { username: data.email }];
    if ((!data.email || data.email === '') && data.phone_no) {
      $or = [{ phone_no: data.phone_no }, { username: data.phone_no }];
    }
    const exist = await this.find({ where: { $or } });

    if (exist.length > 0) {
      if (data.email && exist[0]?.email === data.email) {
        throw new HttpException(AUTH_MESSAGES.EMAIL_EXIST, HttpStatus.CONFLICT);
      } else {
        throw new HttpException(AUTH_MESSAGES.PHONE_EXIST, HttpStatus.CONFLICT);
      }
    }
  }

  async verifyIdetifierDuplication(data: any) {
    const exist = await this.find({ where: { email: data.email } });
    if (exist.length > 0) {
      throw new HttpException(
        AUTH_MESSAGES.USERNAME_EXIST,
        HttpStatus.CONFLICT,
      );
    }
  }

  getAvatar(data: any) {
    return data.avatar
      ? data.avatar
      : `${this.configservice.get('SITE_URL')}/uploads/avatar.png`;
  }

  //   async addFollowing(userId) {
  //     const follow = this.followRepo.create({
  //       user: new ObjectId(userId),
  //       following: [],
  //       followers: [],
  //     });
  //     await this.followRepo.save(follow);
  //   }

  getSSNlast_4(ssn: string) {
    return ssn.substring(ssn.length - 4, ssn.length);
  }

  checkEmpty(info) {
    let Errors = [];
    for (const key in info) {
      if (info[key] === '' || info[key] === null || info[key] === undefined) {
        Errors.push(key);
      }
    }
    if (Errors.length > 0)
      throw new HttpException(
        'Missing Information ' + Errors.toString(),
        HttpStatus.BAD_REQUEST,
      );
    else return true;
  }

  async search(user, query: string) {
    return this.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { identifier: { $regex: query, $options: 'i' } },
            {
              username: { $regex: query, $options: 'i' },
            },
          ],
          _id: { $ne: new ObjectId(user.id) },
          role: { $ne: ROLE.ADMIN },
          status: STATUS.ACTIVE,
        },
      },
      {
        $project: {
          name: 1,
          identifier: 1,
          username: 1,
          avatar: 1,
          _id: 1,
          follower_count: 1,
          following_count: 1,
        },
      },
    ]).toArray();
  }
}
