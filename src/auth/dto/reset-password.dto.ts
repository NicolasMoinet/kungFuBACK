import { Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @MinLength(8, {
    message: 'Le mot de passe doit faire au moins 8 caractères',
  })
  @Matches(
    /^(?=.*[0-9])(?=.*[!@#\$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).+$/,
    { message: 'Format du mot de passe invalide' },
  )
  password: string;
}
