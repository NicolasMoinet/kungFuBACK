import { IsEmail, IsOptional, Matches, MinLength } from 'class-validator';
import { RoleEnumType } from 'src/user/entities/user.entity';
export class CreateAuthDto {
  @IsEmail({},
    {
      message: "Format d'email invalide",
    },
  )
  @Matches(/^((?!yopmail\.com).)*$/, {
    message: 'Ce nom de domaine est interdit',
  })
  email: string;

  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères',
  })
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#\$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).+$/,
    { message: 'Format du mot de passe invalide' },
  )
  password: string;

  @MinLength(2, {
    message: 'Le pseudo doit faire au moins 2 caractères',
  })
  @Matches(/^[a-zA-ZÀ-ÿ]+.*[a-zA-ZÀ-ÿ0-9]$/, {
    message: 'Le pseudo doit forcément commencer et terminer par une lettre',
  })
  name: string;
  role?: RoleEnumType;
}
