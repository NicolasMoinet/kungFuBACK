import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
    nullable: true,
  })
  picture: string;

  @ManyToOne(() => User, (user) => user.blog, { eager: false })
  writer: User;
}
