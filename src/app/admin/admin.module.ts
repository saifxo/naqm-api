import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Data } from 'src/entities/data.entity';
import { DataController } from './data/data.controller';
import { AppCommonModule } from '../app-common/app-common.module';
import { DataService } from './data/data.service';
import { User } from 'src/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [AppCommonModule, TypeOrmModule.forFeature([Data, User])],
  controllers: [DataController, UserController],
  providers: [DataService, UserService],
})
export class AdminModule {}
