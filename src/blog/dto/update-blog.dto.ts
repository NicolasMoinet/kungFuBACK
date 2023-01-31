import { Matches } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class UpdateBlogDto {
  @Matches(/^[a-zA-ZÀ-ÿ]+.*$/, {
    message: 'Le titre doit commencer par une lettre',
  })
  title: string;
  @Matches(/^(202[3-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'La date doit être au format 2023-01-01',
  })
  date: string;
  @Matches(/^[a-zA-ZÀ-ÿ]+.*$/, {
    message: 'La description doit commencer par une lettre',
  })
  description: string;
  picture: string;
  writer?: User;
}
