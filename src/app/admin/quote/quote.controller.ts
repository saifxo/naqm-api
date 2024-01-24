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
import { SORTING_TYPE } from 'src/shared/constants';
import { QuoteService } from './quote.service';

@ApiTags('Admin-Quote Endpoints')
@ApiBearerAuth('JWT-auth')
@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get()
  getQuotes() {
    return this.quoteService.getQuotes();
  }
}
