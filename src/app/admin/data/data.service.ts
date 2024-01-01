import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Data } from 'src/entities/data.entity';
import { UserRepository } from 'src/repository/user.repository';
import { ObjectId } from 'mongodb';
import { ListingDto } from './dto/listing.dto';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Data)
    private dataRepository: MongoRepository<Data>,
    private userRepository: UserRepository,
  ) {}

  async findAllByNode(params: ListingDto) {
    const { id, limit, start } = params;
    const total = await this.dataRepository.find({
      where: { node_id: id },
    });
    const data = await this.dataRepository.find({
      where: { node_id: id },
      skip: start,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return {
      pages: total.length / limit,
      list: data,
      qry: params,
    };
  }
}
