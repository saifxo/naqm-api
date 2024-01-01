import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListingDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  id: number;

  @ApiProperty({ default: 0 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  start: number = 0;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit: number = 10;
}
