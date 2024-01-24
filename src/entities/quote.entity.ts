import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from 'typeorm';

@Entity()
export class Quote {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  number: string;

  @Column()
  email: string;

  @Column()
  product: string;

  @CreateDateColumn()
  created_at: Date;
}
