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
import { ROLE } from 'src/shared/constants';
import { Roles } from 'src/app/authentication/decorators/role.decorator';
import { ListingDto } from './dto/listing.dto';

@ApiTags('Admin-Data')
@ApiBearerAuth('JWT-auth')
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  // @Get('node/:id/:start/:limit')
  // findAll(@Param() params: ListingDto) {
  //   return this.dataService.findAllByNode(params);
  // }
}
