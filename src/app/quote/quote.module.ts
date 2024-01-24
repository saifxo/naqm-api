import { Module } from '@nestjs/common';
import { UserRepository } from 'src/repository/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from 'src/entities/quote.entity';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quote])],
  controllers: [QuoteController],
  providers: [UserRepository, QuoteService],
})
export class QuoteModule {}
