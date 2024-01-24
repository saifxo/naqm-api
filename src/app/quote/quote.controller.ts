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
import { SORTING_TYPE } from 'src/shared/constants';
import { Public } from '../authentication/decorators/is-public.decorator';
import { QuoteService } from './quote.service';
import { QuoteDto } from './dto/add-quote.dto';

@ApiTags('Quote Endpoints')
@Controller('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Public()
  @Post()
  create(@Req() req, @Body() quoteDto: QuoteDto) {
    return this.quoteService.create(quoteDto);
  }
}
