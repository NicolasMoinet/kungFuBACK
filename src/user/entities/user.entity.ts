import { Blog } from 'src/blog/entities/blog.entity';
import { Event } from 'src/event/entities/event.entity';

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
export enum RoleEnumType {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({
    unique: true,
    nullable: false,
    type: 'varchar',
    length: 60,
  })
  email: string;
  @Column({
    nullable: false,
    type: 'varchar',
    length: 60,
  })
  password: string;
  @Column({
    unique: true,
    nullable: false,
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: RoleEnumType,
    default: RoleEnumType.USER,
  })
  role: RoleEnumType;

  @OneToMany(() => Event, (event) => event.organisateur, { eager: false })
  event: Event;
  @ManyToOne(() => Blog, (blog) => blog.writer, { eager: false })
  blog: Blog;
  writer: User;
}
