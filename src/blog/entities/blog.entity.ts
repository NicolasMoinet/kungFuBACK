import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column({
    nullable: false,
  })
  title: string;
  @Column({
    nullable: false,
  })
  date: string;
  @Column({
    nullable: false,
  })
  description: string;
  @Column({
    nullable: false,
  })
  picture: string;

  @OneToMany(() => User, (usr) => usr.writer, { eager: false })
  user: User[];
  writer: User;
}
