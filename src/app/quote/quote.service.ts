import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserRepository } from 'src/repository/user.repository';
import { Data } from 'src/entities/data.entity';
import { Quote } from 'src/entities/quote.entity';
import { QuoteDto } from './dto/add-quote.dto';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepo: MongoRepository<Quote>,
    private userRepository: UserRepository,
  ) {}

  async create(quoteDto: QuoteDto) {
    const newData = this.quoteRepo.create(quoteDto);
    const Dataresponse = await this.quoteRepo.save(newData);
    return 'Quote Request Sent Successfully';
  }
}
