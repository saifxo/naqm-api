import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { UserRepository } from 'src/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Data } from 'src/entities/data.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Data])
  ,HttpModule],
  controllers: [DataController],
  providers: [DataService, UserRepository],
})
export class DataModule {}
