import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { User } from 'src/user/entities/user.entity';

export class UpdateEventDto {
  @IsOptional()
  @Matches(/^[a-zA-ZÀ-ÿ]+.*$/, {
    message: 'Le titre doit commencer par une lettre',
  })
  title: string;

  @IsOptional()
  address: string;

  @IsOptional()
  @Matches(/^[0-9]{5}$/, {
    message: 'Le code postal français doit faire 5 chiffres',
  })
  postalCode: string;

  city: string;

  @IsOptional()
  @Matches(/^(202[3-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/, {
    message: 'La date doit être au format 2023-01-01',
  })
  date: string;

  @IsOptional()
  @Matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "L'heure doit être au format HH:MM",
  })
  time: string;

  @IsOptional()
  @Matches(/^[a-zA-ZÀ-ÿ]+.*$/, {
    message: 'Une description doit commencer par une lettre',
  })
  description: string;

  participants: User[];
}
