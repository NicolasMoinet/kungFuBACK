import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from 'src/blog/entities/blog.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({
    nullable: false,
  })
  title: string;
  @Column({
    nullable: false,
  })
  description: string;
  @Column({
    nullable: false,
  })
  address: string;
  @Column({
    nullable: false,
  })
  postalCode: number;
  @Column({
    nullable: false,
  })
  city: string;
  @Column({
    nullable: false,
  })
  picture: string;
  @ManyToOne(() => User, (user) => user.event, { eager: true })
  organisateur: User;
  @ManyToMany(() => User, { eager: true, cascade: true })
  @JoinTable()
  participants: User[];
}
