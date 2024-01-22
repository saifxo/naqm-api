import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../authentication/guard/roles.guard';
import { VerifiedGuard } from '../authentication/guard/verified.guard';
import { DataService } from './data.service';
import { DataDto } from './dto/add-data.dto';
import { SORTING_TYPE } from 'src/shared/constants';
import { Public } from '../authentication/decorators/is-public.decorator';
import { ListingDto } from './dto/listing.dto';

@ApiTags('Data Endpoints')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Public()
  @Get()
  findAll(@Req() req, @Query() query: ListingDto) {
    return this.dataService.findAll(req.user.id, query);
  }

  @Public()
  @Get('map-readings')
  mapReadings(@Req() req) {
    return this.dataService.mapReadings();
  }

  @Public()
  @Get('readings-by-type/:type')
  readingsByType(@Req() req, @Param('type') type: SORTING_TYPE) {
    return this.dataService.readingsByType(type);
  }

  @Public()
  @Get('latest-readings')
  latestReadings() {
    return this.dataService.latestReadings();
  }

  @Public()
  @Get('latest-readings/node/:nodeId')
  latestReadingsByNode(@Req() req, @Param('nodeId') nodeId: String) {
    return this.dataService.latestReadingsByNode(nodeId);
  }

  @Public()
  @Get('average-aqi')
  averageAqi() {
    return this.dataService.averageAqi();
  }

  @Public()
  @Get('calender-data')
  calenderData() {
    return this.dataService.calenderValues();
  }

  @Public()
  @Get('top-pollutants')
  topPollutants() {
    return this.dataService.topPollutants();
  }

  @Public()
  @Post()
  create(@Req() req, @Body() dataDto: DataDto) {
    return this.dataService.create(req.user, dataDto);
  }
}
