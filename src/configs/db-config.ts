import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DBConfig {
  static getConfigs(configService: ConfigService): TypeOrmModuleOptions {
    return {
      type: 'mongodb',
      host: configService.get('DB_HOST'),
      port: +configService.get('DB_PORT'),
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      entities: ['dist/**/*.entity{.ts,.js}'],
      subscribers: ['dist/**/*.subscriber{.ts,.js}'],
      synchronize: false,
      logging: true,
      useUnifiedTopology: true,
    };
  }
}
