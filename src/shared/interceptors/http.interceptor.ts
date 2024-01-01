import { HttpService } from '@nestjs/axios';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class HttpServiceInterceptor implements NestInterceptor {
  constructor(private httpService: HttpService,
    private config: ConfigService) { }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const ctx: any = context.switchToHttp();
    const token = ctx.getRequest().headers['authorization'];
    if (ctx.token) {
      this.httpService.axiosRef.defaults.headers.common['authorization'] = token;
    }
    return next.handle().pipe();
  }
}