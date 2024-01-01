import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ROLE } from 'src/shared/constants';

export class SignupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ description: 'Required' })
  @IsString()
  password: string;

  @IsEnum(ROLE)
  @ApiProperty({
    description: 'Required',
    default: ROLE.USER,
    examples: [ROLE.ADMIN, ROLE.USER],
  })
  role: ROLE;
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ required: false, description: 'Required' })
  @IsString()
  @IsOptional()
  password: string;

  @IsEnum(ROLE)
  @ApiProperty({
    required: false,
    default: ROLE.USER,
    examples: [ROLE.ADMIN, ROLE.USER],
  })
  @IsOptional()
  role: ROLE;
}
