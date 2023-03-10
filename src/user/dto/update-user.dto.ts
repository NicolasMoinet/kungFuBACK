import { RoleEnumType, User } from '../entities/user.entity';
import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail(
    {},
    {
      message: "Format d'email invalide",
    },
  )
  @Matches(/^((?!yopmail\.com).)*$/, {
    message: 'Ce nom de domaine est interdit',
  })
  email?: string;

  @IsOptional()
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères',
  })
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#\$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).+$/,
    { message: 'Format du mot de passe invalide' },
  )
  password?: string;

  @IsOptional()
  @MinLength(2, {
    message: 'Le pseudo doit faire au moins 2 caractères',
  })
  @Matches(/^[a-zA-ZÀ-ÿ]+.*[a-zA-ZÀ-ÿ0-9]$/, {
    message: 'Le pseudo doit forcément commencer et terminer par une lettre',
  })
  name?: string;

  @IsOptional()
  writer?: User;
  role: RoleEnumType;
}
