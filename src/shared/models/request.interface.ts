import { Request } from 'express';
import { ObjectId } from 'typeorm';

export type USEROBJ = { role: string; id: ObjectId };

export interface NaqmRequest extends Request {
  user: USEROBJ;
}
