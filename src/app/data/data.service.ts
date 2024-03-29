import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { UserRepository } from 'src/repository/user.repository';
import { Data } from 'src/entities/data.entity';
import { ListingDto } from './dto/listing.dto';
import { DataDto } from './dto/add-data.dto';
import { AQI_STATUS, SORTING_TYPE } from 'src/shared/constants';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Data)
    private dataRepository: MongoRepository<Data>,
    
    private httpService: HttpService
  ) {}

  calculateForReading(C, IndexValues) {
    const ranges = [
      [0, 50],
      [51, 100],
      [101, 150],
      [151, 200],
      [201, 300],
      [301, 500],
    ];
    let AQI;
    
    // Check if C is outside the concentration ranges
    if (C < IndexValues[0][0]) {
        AQI = ranges[0][0]; // Return the minimum AQI value
    } else if (C > IndexValues[IndexValues.length - 1][1]) {
        AQI = ranges[ranges.length - 1][1]; // Return the maximum AQI value
    } else {
        // Find the corresponding range for C
        let rangeIndex;
        for (let i = 0; i < IndexValues.length; i++) {
            if (C >= IndexValues[i][0] && C <= IndexValues[i][1]) {
                rangeIndex = i;
                break;
            }
        }

        // Get the corresponding index values
        let Imax = ranges[rangeIndex][1];
        let Imin = ranges[rangeIndex][0];

        // Interpolate AQI using the formula
        AQI = ((Imax - Imin) / (IndexValues[rangeIndex][1] - IndexValues[rangeIndex][0])) * (C - IndexValues[rangeIndex][0]) + Imin;

        // Round AQI to the nearest integer
        AQI = Math.round(AQI);
    }
    
    return AQI;
  }

 

  calculateAQIHighest(AQIs) {
    let sum = 0;
    AQIs.forEach(function(AQI) {
        sum += AQI;
    });
    return Math.round(sum / AQIs.length);
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

  async create(user, data) {
    const nh3Indexvalues = [
        [0, 200],
        [201, 400],
        [401, 800],
        [801, 1200],
        [1201, 1800],
        [1800, 4000]
    ];
    const coIndexvalues = [
        [0, 4.4],
        [4.5, 9.4],
        [9.5, 12.4],
        [12.5, 15.4],
        [15.5, 30.4],
        [30.5, 40.4],
    ];
    const no2Indexvalues = [
        [0, 40],
        [41, 80],
        [81, 180],
        [181, 280],
        [281, 400],
        [400, 4000]
    ];
    const ch4Indexvalues = [
        [0, 50],
        [51, 100],
        [101, 150],
        [151, 200],
        [201, 300],
        [301, 400]
    ];
    const co2Indexvalues = [
        [0, 400],
        [401, 1000],
        [1001, 1500],
        [1501, 2000],
        [2001, 3000],
        [3001, 5000],
    ];
    const dustIndexvalues = [
        [0, 12],
        [13, 35.4],
        [35.5, 150.4],
        [150.5, 250.4],
        [250.5, 350.4]
    ];
    const pm10Indexvalues = [
        [0, 54],
        [55, 154],
        [155, 254],
        [255, 354],
        [355, 424],
        [425, 504]
    ];
    const date = new Date();
    date.setUTCHours(date.getUTCHours() - 24);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const currentDate = new Date();
    let pipeline = [
        {
            $match: {
                created_at: {
                    $gte: new Date(Date.UTC(year, month - 1, day)),
                    $lt: currentDate,
                },
                node_id: data?.node_id,
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
    console.log("old readings avg", readingsOld);
    if(readingsOld==undefined || readingsOld==null ){
      const dustAQI = this.calculateForReading(0, dustIndexvalues);
      const no2AQI = this.calculateForReading(0, no2Indexvalues);
      const ch4AQI = this.calculateForReading(0, ch4Indexvalues);
      const co2AQI = this.calculateForReading(0, co2Indexvalues);
      const coAQI = this.calculateForReading(0, coIndexvalues);
      const nh3AQI = this.calculateForReading(0, nh3Indexvalues);
      const pm10AQI = this.calculateForReading(0, pm10Indexvalues);
      let AQI = Math.round(this.calculateAQIHighest([
          dustAQI,
          nh3AQI,
          co2AQI,
          
          no2AQI,
          ch4AQI,
          pm10AQI
      ]));
      AQI = AQI ? AQI : 0;
      console.log("new AQI", AQI);
      console.log("dust", dustAQI);
      console.log("co", coAQI);
      console.log("co2", co2AQI);
      console.log("pm10", pm10AQI);
      console.log("ch4", ch4AQI);
      console.log("nh3", nh3AQI);
      console.log("no2", no2AQI);
  
  
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
    else{
      const dustAQI = this.calculateForReading(readingsOld?.dust, dustIndexvalues);
      const no2AQI = this.calculateForReading(readingsOld?.no2, no2Indexvalues);
      const ch4AQI = this.calculateForReading(readingsOld?.ch4, ch4Indexvalues);
      const co2AQI = this.calculateForReading(readingsOld?.co2, co2Indexvalues);
      const coAQI = this.calculateForReading(readingsOld?.co, coIndexvalues);
      const nh3AQI = this.calculateForReading(readingsOld?.nh3, nh3Indexvalues);
      const pm10AQI = this.calculateForReading(readingsOld?.pm_ten, pm10Indexvalues);
      let AQI = Math.round(this.calculateAQIHighest([
          dustAQI,
          nh3AQI,
          co2AQI,
          
          no2AQI,
          ch4AQI,
          pm10AQI
      ]));
      AQI = AQI ? AQI : 0;
      console.log("new AQI", AQI);
      console.log("dust", dustAQI);
      console.log("co", coAQI);
      console.log("co2", co2AQI);
      console.log("pm10", pm10AQI);
      console.log("ch4", ch4AQI);
      console.log("nh3", nh3AQI);
      console.log("no2", no2AQI);
  
  
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

  async latestReadingsByNode(nodeId: String) {
    const reading = this.dataRepository.find({
      where: { node_id: nodeId },
      order: { created_at: 'DESC' },
    });

    return reading;
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
    interface Data {
      created_at: Date;
      dust: number;
      no2: number;
      ch4: number;
      co2: number;
      co: number;
      nh3: number;
      pm_one: number;
      pm_ten: number;
      temp: number;
      humid: number;
      aqi: number;
    }
    
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); 
    console.log('current date', currentDate);
    
    const date2 = new Date(currentDate);
    date2.setDate(date2.getDate() - 6); 
    console.log('last 6 date', date2);
    let pipeline2 = [
      {
        $match: {
          created_at: {
            $gte: date2,
            $lt: currentDate, 
          },
        },
      },
      {
        $addFields: {
          day: { $dayOfMonth: '$created_at' },
        },
      },
      {
        $group: {
          _id: {
            day: '$day',
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
          humid: { $avg: '$humid' },
          temp: { $avg: '$temp' },
          aqi: { $avg: '$aqi' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          dust: 1,
          no2: 1,
          ch4: 1,
          co2: 1,
          co: 1,
          nh3: 1,
          pm_one: 1,
          pm_ten: 1,
          temp: 1,
          humid: 1,
          aqi: 1,
        },
      },
    ];
    
    const readings2: Data[] = await this.dataRepository.aggregate(pipeline2).toArray();
    
    
   
const dataRows = Array.from({ length: 6 }, () =>
Array(7).fill(0)
);

readings2.forEach((reading, index) => {
const rowIndex = 5 - index; 

dataRows[rowIndex] = [
  reading.co || 0,
  reading.dust || 0,
  reading.humid || 0,
  reading.no2 || 0,
  reading.co2 || 0,
  reading.temp || 0,
  reading.aqi || 0
];
});
let payload={"data":dataRows}

console.log('Last 6 days data:');
console.log(payload);






try {
  const predictionResponse = await this.httpService.post('http://68.183.83.33:8000/predict', payload).toPromise();
  console.log('Prediction Response:', predictionResponse.data);

  console.log('Last 6 days data:');
  console.log(payload);
  
  const mapReadings = await this.dataRepository.aggregate(pipeline).toArray();
  
  const combinedData = {
    prediction: predictionResponse.data,
    mapReadings: mapReadings
  };

  return combinedData;
} catch (error) {
  
  console.error('Error sending POST request:', error);
  throw error;
}
}

  async averageAqi() {
    const data = await this.latestReadings();
    let totalAqi = 0;

    for (let i = 0; i < data.mapReadings.length; i++) {
      totalAqi = totalAqi + data[i].aqi;
    }

    const avgAqi = Math.round(totalAqi / data.mapReadings.length);

    const status = this.findStatus(avgAqi);

    return {
      avgAqi,
      status,
    };
  }

  async avgAqiGraph() {
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
      {
        $sort: { 'date.day': 1 },
      },
    ];

    const readings = await this.dataRepository.aggregate(pipeline).toArray();

    return readings;
  }

  async calenderValues() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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

    for (let i = 0; i < latestReadings.mapReadings.length; i++) {
      nh3 = nh3 + latestReadings[i].nh3;
      co = co + latestReadings[i].co;
      co2 = co2 + latestReadings[i].co2;
      no2 = no2 + latestReadings[i].no2;
      ch4 = ch4 + latestReadings[i].ch4;
      dust = dust + latestReadings[i].dust;
    }

    nh3 = nh3 / latestReadings.mapReadings.length;
    co = co / latestReadings.mapReadings.length;
    co2 = co2 / latestReadings.mapReadings.length;
    no2 = no2 / latestReadings.mapReadings.length;
    ch4 = ch4 / latestReadings.mapReadings.length;
    dust = dust / latestReadings.mapReadings.length;

    const nh3Indexvalues = [
      [0, 200],
      [201, 400],
      [401, 800],
      [801, 1200],
      [1201, 1800],
      [1800, 4000]
  ];
  const coIndexvalues = [
      [0, 4.4],
      [4.5, 9.4],
      [9.5, 12.4],
      [12.5, 15.4],
      [15.5, 30.4],
      [30.5, 40.4],
  ];
const no2Indexvalues = [
      [0, 40],
      [41, 80],
      [81, 180],
      [181, 280],
      [281, 400],
      [400, 4000]
  ];
  const ch4Indexvalues = [
      [0, 50],
      [51, 100],
      [101, 150],
      [151, 200],
      [201, 300],
      [301, 400]
  ];
  const co2Indexvalues = [
      [0, 400],
      [401, 1000],
      [1001, 1500],
      [1501, 2000],
      [2001, 3000],
      [3001, 5000],
  ];
  const dustIndexvalues = [
      [0, 12],
      [13, 35.4],
      [35.5, 150.4],
      [150.5, 250.4],
      [250.5, 350.4]
  ];
  const pm10Indexvalues = [
      [0, 54],
      [55, 154],
      [155, 254],
      [255, 354],
      [355, 424],
      [425, 504]
  ];
  const dustAQI = this.calculateForReading(dust, dustIndexvalues);
  const no2AQI = this.calculateForReading(no2, no2Indexvalues);
  const ch4AQI = this.calculateForReading(ch4, ch4Indexvalues);
  const co2AQI = this.calculateForReading(co2, co2Indexvalues);

  const nh3AQI = this.calculateForReading(nh3, nh3Indexvalues);
  // const nh3AQI = this.calculateForReading(nh3, nh3Indexvalues);
  const objArray = [
      { name: 'Dust', aqi: dustAQI },
      { name: 'no2', aqi: no2AQI },
      { name: 'ch4', aqi: ch4AQI },
      { name: 'co2', aqi: co2AQI },

      { name: 'nh3', aqi: nh3AQI },
  ];
  objArray.sort(function (a, b) {
      return b.aqi - a.aqi;
  });
  return objArray.slice(0, 3);
}
}
