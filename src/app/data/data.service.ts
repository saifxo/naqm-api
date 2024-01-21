import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserRepository } from 'src/repository/user.repository';
import { Data } from 'src/entities/data.entity';
import { ListingDto } from './dto/listing.dto';
import { DataDto } from './dto/add-data.dto';
import { AQI_STATUS, SORTING_TYPE } from 'src/shared/constants';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Data)
    private dataRepository: MongoRepository<Data>,
    private userRepository: UserRepository,
  ) {}

  calculateForReading(reading, range) {
    const ranges = [
      [0, 50],
      [51, 100],
      [101, 150],
      [151, 200],
      [201, 300],
      [301, 500],
    ];

    for (let counter = 0; counter < range.length; counter++) {
      if (reading <= range[counter] || counter === range.length - 1) {
        const [iHi, iLo] = ranges[counter];
        return this.calculateAQI(
          iHi,
          iLo,
          range[counter],
          counter === 0 ? 0 : range[counter - 1],
          counter === range.length - 1 ? range[counter] : reading,
        );
      }
    }
  }

  calculateAQI(iHi, iLo, bpHi, bpLo, cP) {
    return Math.round(((iHi - iLo) / (bpHi - bpLo)) * (cP - bpLo) + iLo);
  }

  calculateAQIHighest(AQIs) {
    AQIs.sort(function (a, b) {
      return b - a;
    });

    return AQIs[0];
  }

  findStatus(aqi) {
    if (aqi >= 0 && aqi <= 50) {
      return AQI_STATUS.GOOD;
    }
    if (aqi >= 51 && aqi <= 100) {
      return AQI_STATUS.MODERATE;
    }
    if (aqi >= 101 && aqi <= 150) {
      return AQI_STATUS.UNHEALTHY_SENSITIVE;
    }
    if (aqi >= 151 && aqi <= 200) {
      return AQI_STATUS.UNHEALTHY;
    }
    if (aqi >= 201 && aqi <= 300) {
      return AQI_STATUS.VERY_UNHEALTHY;
    }
    if (aqi >= 301 && aqi <= 500) {
      return AQI_STATUS.HAZARDOUS;
    }
  }

  async findAll(id, query: ListingDto) {
    const data = await this.dataRepository.find({
      order: { created_at: 'DESC' },
      skip: Number(query.start),
      take: Number(query.limit),
    });
    return data;
  }

  async create(user, data: DataDto) {
    const nh3Index = [200, 400, 800, 1200, 1800];
    const coIndex = [4.4, 9.4, 12.4, 15.4, 30.4, 40.4];
    const no2Index = [0.053, 0.1, 0.36, 0.65, 1.24, 1.64];
    const ch4Index = [50, 100, 150, 200, 300, 400];
    const co2Index = [1000, 2000, 5000, 10000, 20000, 40000];
    const dustIndex = [12, 35.4, 150.4, 250.4, 350.4];
    // const pm1Index = []
    // const pm10Index = []

    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    let pipeline = [
      {
        $match: {
          created_at: {
            $gte: new Date(`${year}-${month + 1}-${day - 1}`),
            $lt: new Date(`${year}-${month + 1}-${day}`),
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
          dust: { $avg: '$dust' },
          no2: { $avg: '$no2' },
          ch4: { $avg: '$ch4' },
          co2: { $avg: '$co2' },
          co: { $avg: '$co' },
          nh3: { $avg: '$nh3' },
          pm_one: { $avg: '$pm_one' },
          pm_ten: { $avg: '$pm_ten' },
        },
      },
      {
        $project: {
          _id: 0,
          dust: 1,
          no2: 1,
          ch4: 1,
          co2: 1,
          co: 1,
          nh3: 1,
          pm_one: 1,
          pm_ten: 1,
        },
      },
    ];

    const readings = await this.dataRepository.aggregate(pipeline).toArray();

    const readingsOld = readings[0];
    const dustAQI = this.calculateForReading(readingsOld?.dust, dustIndex);
    const no2AQI = this.calculateForReading(readingsOld?.no2, no2Index);
    const ch4AQI = this.calculateForReading(readingsOld?.ch4, ch4Index);
    const co2AQI = this.calculateForReading(readingsOld?.co2, co2Index);
    const coAQI = this.calculateForReading(readingsOld?.co, coIndex);
    const nh3AQI = this.calculateForReading(readingsOld?.nh3, nh3Index);

    // const pm1AQI = this.calculateForReading(data.pm_one, nh3Index);
    // const pm10AQI = this.calculateForReading(data.pm_ten, nh3Index);

    let AQI = Math.round(
      this.calculateAQIHighest([
        dustAQI,
        nh3AQI,
        co2AQI,
        coAQI,
        no2AQI,
        ch4AQI,
      ]),
    );

    AQI = AQI ? AQI : 0;

    const status = this.findStatus(AQI);

    const newData = this.dataRepository.create({
      ...data,
      aqi: AQI,
      status: status,
      date: new Date().toISOString().slice(0, 10),
    });
    const Dataresponse = await this.dataRepository.save(newData);
    return 'Data Sent Successfully';
  }

  async mapReadings() {
    const mapReadings = await this.dataRepository
      .aggregate([
        {
          $sort: { created_at: -1 }, // Sort by node_id and timestamp in descending order
        },
        {
          $group: {
            _id: { node_id: '$node_id', name: '$name' },
            lat: { $first: '$lat' },
            lng: { $first: '$lng' },
            aqi: { $first: '$aqi' },
          },
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field from the output
            node_id: '$_id.node_id',
            name: '$_id.name',
            lat: 1,
            lng: 1,
            aqi: 1,
          },
        },
      ])
      .toArray();
    return mapReadings;
  }

  async readingsByType(type: SORTING_TYPE) {
    let pipeline = [
      {
        $sort: { node_id: 1, created_at: -1 }, // Sort by node_id and timestamp in descending order
      },
      {
        $group: {
          _id: { node_id: '$node_id', name: '$name' },
          lat: { $first: '$lat' },
          lng: { $first: '$lng' },
          aqi: { $first: '$aqi' },
          pm_one: { $first: '$pm_one' },
          pm_ten: { $first: '$pm_ten' },
          nh3: { $first: '$nh3' },
          co: { $first: '$co' },
          co2: { $first: '$co2' },
          no2: { $first: '$no2' },
          ch4: { $first: '$ch4' },
          dust: { $first: '$dust' },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          node_id: '$_id.node_id',
          name: '$_id.name',
          lat: 1,
          lng: 1,
          aqi: 1,
          pm_one: 1,
          pm_ten: 1,
          nh3: 1,
          co: 1,
          co2: 1,
          no2: 1,
          ch4: 1,
          dust: 1,
        },
      },
      type && {
        $sort: { aqi: type === SORTING_TYPE.CLEANEST ? 1 : -1 },
      },
    ];

    const mapReadings = await this.dataRepository.aggregate(pipeline).toArray();
    return mapReadings;
  }

  async latestReadings() {
    let pipeline = [
      {
        $sort: { created_at: -1 }, // Sort by node_id and timestamp in descending order
      },
      {
        $group: {
          _id: { node_id: '$node_id', name: '$name' },
          lat: { $first: '$lat' },
          lng: { $first: '$lng' },
          aqi: { $first: '$aqi' },
          pm_one: { $first: '$pm_one' },
          pm_ten: { $first: '$pm_ten' },
          nh3: { $first: '$nh3' },
          co: { $first: '$co' },
          co2: { $first: '$co2' },
          no2: { $first: '$no2' },
          ch4: { $first: '$ch4' },
          dust: { $first: '$dust' },
          temp: { $first: '$temp' },
          humid: { $first: '$humid' },
          status: { $first: '$status' },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          node_id: '$_id.node_id',
          name: '$_id.name',
          lat: 1,
          lng: 1,
          aqi: 1,
          pm_one: 1,
          pm_ten: 1,
          nh3: 1,
          co: 1,
          co2: 1,
          no2: 1,
          ch4: 1,
          dust: 1,
          temp: 1,
          humid: 1,
          status: 1,
        },
      },
    ];

    const mapReadings = await this.dataRepository.aggregate(pipeline).toArray();
    return mapReadings;
  }

  async averageAqi() {
    const data = await this.latestReadings();
    let totalAqi = 0;

    for (let i = 0; i < data.length; i++) {
      totalAqi = totalAqi + data[i].aqi;
    }

    const avgAqi = Math.round(totalAqi / data.length);

    const status = this.findStatus(avgAqi);

    return {
      avgAqi,
      status,
    };
  }

  async calenderValues() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let pipeline = [
      {
        $match: {
          created_at: {
            $gte: new Date(`${currentYear}-${currentMonth}-01`),
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
        },
      },
    ];

    const readings = await this.dataRepository.aggregate(pipeline).toArray();

    return readings;
  }

  async topPollutants() {
    const latestReadings = await this.latestReadings();

    // (latestReadings);

    let nh3 = 0;
    let co = 0;
    let co2 = 0;
    let no2 = 0;
    let ch4 = 0;
    let dust = 0;

    for (let i = 0; i < latestReadings.length; i++) {
      nh3 = nh3 + latestReadings[i].nh3;
      co = co + latestReadings[i].co;
      co2 = co2 + latestReadings[i].co2;
      no2 = no2 + latestReadings[i].no2;
      ch4 = ch4 + latestReadings[i].ch4;
      dust = dust + latestReadings[i].dust;
    }

    nh3 = nh3 / latestReadings.length;
    co = co / latestReadings.length;
    co2 = co2 / latestReadings.length;
    no2 = no2 / latestReadings.length;
    ch4 = ch4 / latestReadings.length;
    dust = dust / latestReadings.length;

    const nh3Index = [200, 400, 800, 1200, 1800];
    const coIndex = [4.4, 9.4, 12.4, 15.4, 30.4, 40.4];
    const no2Index = [0.053, 0.1, 0.36, 0.65, 1.24, 1.64];
    const ch4Index = [50, 100, 150, 200, 300, 400];
    const co2Index = [1000, 2000, 5000, 10000, 20000, 40000];
    const dustIndex = [12, 35.4, 150.4, 250.4, 350.4];

    const dustAQI = this.calculateForReading(dust, dustIndex);
    const no2AQI = this.calculateForReading(no2, no2Index);
    const ch4AQI = this.calculateForReading(ch4, ch4Index);
    const co2AQI = this.calculateForReading(co2, co2Index);
    const coAQI = this.calculateForReading(co, coIndex);
    const nh3AQI = this.calculateForReading(nh3, nh3Index);

    const objArray = [
      { name: 'Dust', aqi: dustAQI },
      { name: 'no2', aqi: no2AQI },
      { name: 'ch4', aqi: ch4AQI },
      { name: 'co2', aqi: co2AQI },
      { name: 'co', aqi: coAQI },
      { name: 'nh3', aqi: nh3AQI },
    ];

    objArray.sort(function (a, b) {
      return b.aqi - a.aqi;
    });

    return objArray.slice(0, 3);
  }
}
