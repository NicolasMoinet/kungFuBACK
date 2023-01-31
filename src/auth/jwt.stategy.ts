import { Injectable } from '@nestjs/common';
import { PassportStrategy, PassportModule } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayload } from './jwt-payload.interface';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
// import { UsersRepository } from './user.repository';
import * as dotenv from 'dotenv';
import { UnauthorizedException } from '@nestjs/common/exceptions';

dotenv.config({ path: '.env' });

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Dans notre constructor, on injecte de nouveau notre userRepository et avec super on accède à des méthodes de la class héritage PassportStrategy
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<User> {
    // on extrait l'email depuis le payload renvoyé par AuthGuard (le middleware de Nest) et on return le user correspondant
    console.log('validate ');
    console.log('payload : ', payload);
    const { user } = payload;
    const isUserExist: User = await this.usersRepository.findOneBy({
      email: user.email,
    });

    // si ce user n'existe pas, on renvoie une erreur 401
    if (!isUserExist) throw new UnauthorizedException();

    return user;
  }
}
