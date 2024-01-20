import { ObjectId } from 'mongodb';
import { ROLE, STATUS } from 'src/shared/constants';
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Data {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  node_id: number;

  @Column()
  dust: number;

  @Column()
  no2: number;

  @Column()
  ch4: number;

  @Column()
  co2: number;

  @Column()
  co: number;

  @Column()
  nh3: number;

  @Column()
  pm_one: number;

  @Column()
  pm_ten: number;

  @Column()
  temp: number;

  @Column()
  humid: number;

  @Column()
  aqi: number;

  @Column()
  lat: number;

  @Column()
  lng: number;

  @Column()
  status: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  created_at: Date;
}
