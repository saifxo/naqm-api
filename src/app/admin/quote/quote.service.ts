import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserRepository } from 'src/repository/user.repository';
import { Data } from 'src/entities/data.entity';
import { Quote } from 'src/entities/quote.entity';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepo: MongoRepository<Quote>,
    private userRepository: UserRepository,
  ) {}

  async getQuotes() {
    const quotes = this.quoteRepo.find({
      order: { created_at: 'DESC' },
    });

    return quotes;
  }
}
