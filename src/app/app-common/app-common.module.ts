import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repository/user.repository';
const providers = [UserRepository];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [...providers],
  exports: [UserRepository],
})
export class AppCommonModule {}
