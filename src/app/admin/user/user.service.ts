import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Data } from 'src/entities/data.entity';
import { UserRepository } from 'src/repository/user.repository';
import { ObjectId } from 'mongodb';
import { UpdateUserDto } from './dto/user.dto';
import { MESSAGES } from './user.messages';
import { ROLE } from 'src/shared/constants';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(data) {
    try {
      const response = await this.userRepository.onboard(data);
      return MESSAGES.USER_CREATED;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  async update(id: string, user: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOne({
      where: { _id: new ObjectId(id) },
    });
    if (!userToUpdate) {
      throw new HttpException(MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    Object.assign(userToUpdate, user);
    await this.userRepository.save(userToUpdate);
    return MESSAGES.USER_UPDATED;
  }

  async delete(id: string) {
    try {
      const userToDelete = await this.userRepository.findOne({
        where: { _id: new ObjectId(id) },
      });
      if (!userToDelete) {
        throw new HttpException(MESSAGES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }
      await this.userRepository.remove(userToDelete);
      return MESSAGES.USER_DELETED;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  async findAllUsers() {
    const users = await this.userRepository.find({
      where: {
        role: ROLE.USER,
      },
    });
    return users;
  }
}
