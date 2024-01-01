import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
export class AuthDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString({ each: true })
  @Transform((o) => o.value.split(','))
  rel: string[];
}
