import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Data } from 'src/entities/data.entity';
import { UserRepository } from 'src/repository/user.repository';
import { ObjectId } from 'mongodb';
import { ListingDto } from './dto/listing.dto';
import { GRAPH_TYPE } from 'src/shared/constants';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Data)
    private dataRepository: MongoRepository<Data>,
    private userRepository: UserRepository,
  ) {}

  async averageGraph(type: GRAPH_TYPE) {
    if (type === GRAPH_TYPE.WEEK) {
      const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let pipeline = [
        {
          $match: {
            created_at: {
              $gte: sevenDaysAgo,
            },
          },
        },

        {
          $group: {
            _id: {
              day: { $dayOfMonth: '$created_at' },
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
            },
            aqi: { $avg: '$aqi' },
            dust: { $avg: '$dust' },
            co2: { $avg: '$co2' },
            co: { $avg: '$co' },
            no2: { $avg: '$no2' },
            nh3: { $avg: '$nh3' },
            ch4: { $avg: '$ch4' },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              day: '$_id.day',
              month: '$_id.month',
              year: '$_id.year',
            },
            aqi: 1,
            dust: 1,
            co2: 1,
            co: 1,
            no2: 1,
            nh3: 1,
            ch4: 1,
          },
        },
        {
          $sort: { 'date.day': 1 },
        },
      ];

      const readings = await this.dataRepository.aggregate(pipeline).toArray();
      const aqiArr = [];
      const dustArr = [];
      const co2Arr = [];
      const coArr = [];
      const no2Arr = [];
      const nh3Arr = [];
      const ch4Arr = [];
      const labels = [];

      for (let i = 0; i < readings.length; i++) {
        aqiArr.push(readings[i].aqi);
        dustArr.push(readings[i].dust);
        co2Arr.push(readings[i].co2);
        coArr.push(readings[i].co);
        no2Arr.push(readings[i].no2);
        nh3Arr.push(readings[i].nh3);
        ch4Arr.push(readings[i].ch4);
        labels.push(readings[i].date);
      }

      const data = {
        aqi: aqiArr,
        dust: dustArr,
        co2: co2Arr,
        co: coArr,
        no2: no2Arr,
        nh3: nh3Arr,
        ch4: ch4Arr,
        labels,
      };

      return data;
    }
    if (type === GRAPH_TYPE.MONTH) {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), 0, 1);
      let pipeline = [
        {
          $match: {
            created_at: {
              $gte: firstDay,
            },
          },
        },

        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
            },
            aqi: { $avg: '$aqi' },
            dust: { $avg: '$dust' },
            co2: { $avg: '$co2' },
            co: { $avg: '$co' },
            no2: { $avg: '$no2' },
            nh3: { $avg: '$nh3' },
            ch4: { $avg: '$ch4' },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              day: '$_id.day',
              month: '$_id.month',
              year: '$_id.year',
            },
            aqi: 1,
            dust: 1,
            co2: 1,
            co: 1,
            no2: 1,
            nh3: 1,
            ch4: 1,
          },
        },
        {
          $sort: { 'date.day': 1 },
        },
      ];

      const readings = await this.dataRepository.aggregate(pipeline).toArray();
      const aqiArr = [];
      const dustArr = [];
      const co2Arr = [];
      const coArr = [];
      const no2Arr = [];
      const nh3Arr = [];
      const ch4Arr = [];
      const labels = [];

      for (let i = 0; i < readings.length; i++) {
        aqiArr.push(readings[i].aqi);
        dustArr.push(readings[i].dust);
        co2Arr.push(readings[i].co2);
        coArr.push(readings[i].co);
        no2Arr.push(readings[i].no2);
        nh3Arr.push(readings[i].nh3);
        ch4Arr.push(readings[i].ch4);
        labels.push(readings[i].date);
      }

      const data = {
        aqi: aqiArr,
        dust: dustArr,
        co2: co2Arr,
        co: coArr,
        no2: no2Arr,
        nh3: nh3Arr,
        ch4: ch4Arr,
        labels,
      };

      return data;
    }
    if (type == GRAPH_TYPE.YEAR) {
      let pipeline = [
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
            },
            aqi: { $avg: '$aqi' },
            dust: { $avg: '$dust' },
            co2: { $avg: '$co2' },
            co: { $avg: '$co' },
            no2: { $avg: '$no2' },
            nh3: { $avg: '$nh3' },
            ch4: { $avg: '$ch4' },
          },
        },
        {
          $project: {
            _id: 0,
            date: {
              day: '$_id.day',
              month: '$_id.month',
              year: '$_id.year',
            },
            aqi: 1,
            dust: 1,
            co2: 1,
            co: 1,
            no2: 1,
            nh3: 1,
            ch4: 1,
          },
        },
        {
          $sort: { 'date.day': 1 },
        },
      ];

      const readings = await this.dataRepository.aggregate(pipeline).toArray();
      const aqiArr = [];
      const dustArr = [];
      const co2Arr = [];
      const coArr = [];
      const no2Arr = [];
      const nh3Arr = [];
      const ch4Arr = [];
      const labels = [];

      for (let i = 0; i < readings.length; i++) {
        aqiArr.push(readings[i].aqi);
        dustArr.push(readings[i].dust);
        co2Arr.push(readings[i].co2);
        coArr.push(readings[i].co);
        no2Arr.push(readings[i].no2);
        nh3Arr.push(readings[i].nh3);
        ch4Arr.push(readings[i].ch4);
        labels.push(readings[i].date);
      }

      const data = {
        aqi: aqiArr,
        dust: dustArr,
        co2: co2Arr,
        co: coArr,
        no2: no2Arr,
        nh3: nh3Arr,
        ch4: ch4Arr,
        labels,
      };

      return data;
    }
  }
}
