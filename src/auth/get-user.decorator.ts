import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

// Ce décorateur permet de récupérer le user créé dans le contexte par jwt.stategy et il le réinjecte dans la request (cf doc de nest)
export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
