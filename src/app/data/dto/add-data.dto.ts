import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DataDto {
  @ApiProperty()
  @IsNumber()
  node_id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  dust: number;

  @ApiProperty()
  @IsNumber()
  no2: number;

  @ApiProperty()
  @IsNumber()
  ch4: number;

  @ApiProperty()
  @IsNumber()
  co2: number;

  @ApiProperty()
  @IsNumber()
  co: number;

  @ApiProperty()
  @IsNumber()
  nh3: number;

  @ApiProperty()
  @IsNumber()
  pm_one: number;

  @ApiProperty()
  @IsNumber()
  pm_ten: number;

  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}
