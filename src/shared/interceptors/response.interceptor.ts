import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '../models';

export interface Response<T> {
  statusCode: number;
  message: string | Array<string>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((resp: any) => {

      const statusCode = context.switchToHttp().getResponse().statusCode;

      const structuredResp = new AppResponse(resp);
      structuredResp.status(statusCode);
      if (!structuredResp.message && !structuredResp.data) {
        if (typeof resp === 'string') {
          structuredResp.prop('message', resp);
        } else {
          structuredResp.prop('data', resp);
        }
      }
      return structuredResp;
    }));
  }
}