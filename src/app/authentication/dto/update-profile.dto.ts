import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsLatitude,
  IsLongitude, IsMobilePhone, IsNumber, IsOptional, IsString,
  ValidateIf,
  ValidateNested
} from 'class-validator';



export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string;


  @ApiProperty({ description: 'Optional', required:false  })
  @IsOptional()
  @IsString()
  avatar: string;

  @ApiProperty({ example: '20 years', required:false })
  @IsOptional()
  @IsNumber()
  age: number;

}
