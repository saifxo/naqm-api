import { ApiProperty } from '@nestjs/swagger';
import { IsString ,  ValidateIf} from 'class-validator';

export class LogInDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @ValidateIf((o) => !o.biometric_hash || o.biometric_hash === '')
  @IsString()
  password: string;
  
}
