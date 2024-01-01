import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { UserRepository } from 'src/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Data } from 'src/entities/data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Data])],
  controllers: [DataController],
  providers: [DataService, UserRepository],
})
export class DataModule {}
