import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ListingDto {
  @ApiProperty()
  @IsString()
  start: string;

  @ApiProperty()
  @IsString()
  limit: string;
}
