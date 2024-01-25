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
import { DataService } from './data.service';
import { RolesGuard } from 'src/app/authentication/guard/roles.guard';
import { GRAPH_TYPE, ROLE } from 'src/shared/constants';
import { Roles } from 'src/app/authentication/decorators/role.decorator';
import { ListingDto } from './dto/listing.dto';

@ApiTags('Admin-Data')
@ApiBearerAuth('JWT-auth')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Get('average-graph/:type')
  averageGraph(@Param('type') type: GRAPH_TYPE) {
    return this.dataService.averageGraph(type);
  }
}
