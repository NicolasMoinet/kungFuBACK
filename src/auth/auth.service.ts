import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt/dist';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
dotenv.config({ path: '.env' });
@Injectable()
export class AuthService {
  // on déclare dans notre constructor les méthodes qui nous serviront à modifier notre userRepository et générer/checker notre JWT
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async register(createAuthDto: CreateAuthDto) {
    // on récupère les propriétés du DTO en les déstructurant
    const { email, password, name, role } = createAuthDto;

    // hashage du mot de passe
    const salt = await bcrypt.genSalt();
    console.log('génération du salt : ', salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('mot de passe haché : ', hashedPassword);

    // création d'une entité user en remplaçant le password non crypté par celui hashé
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });
    try {
      // enregistrement de l'entité user
      const createdUser = await this.userRepository.save(user);
      // on delete le password pour ne pas qu'il apparaisse dans la réponse du serveur afin d'éviter toute manipulation de cette info côté front
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      console.log('error user register : ', error);
      // gestion des erreurs
      console.log(error.detail.includes('name'));
      if (error.code === '23505' && error.detail.includes('email')) {
        throw new ConflictException('Cet email existe déjà');
      } else if (error.code === '23505' && error.detail.includes('name')) {
        throw new ConflictException('Ce pseudo existe déjà');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(loginDto: LoginDto) {
    // On récupère les propriétés du DTO en les déstructurant
    const { email, password } = loginDto;
    // On vérifie si l'email rentré existe dans notre bdd et si oui, on récupère le user correspondant
    const user = await this.userRepository.findOneBy({ email });

    // On vérifie avec bcrypt si le password du body est le même que le password du user récupéré par son email
    if (user && (await bcrypt.compare(password, user.password))) {
      // Si ok, on stocke l'email rentré dans le formulaire (côté front) dans une constante payload
      delete user.password;
      const payload = { user };
      console.log('payload stocké dans token : ', payload);
      // On génère notre accessToken grâce à jwtService et on y injecte notre payload
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('Identifiants incorrects');
    }
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDto) {
    const { email } = forgotPasswordDTO;
    console.log('forgotpassword : ', email);

    const user = await this.userRepository.findOneBy({ email });
    console.log('forgot password - user found : ', user);

    if (!user) {
      throw new NotFoundException(`Pas d'utilisateur avec cet email`);
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    const accessToken = jwt.sign({ sub: user.id, email: user.email }, secret, {
      expiresIn: '5m',
    });

    console.log('forgot password - accessToken : ', accessToken);

    const link = `http://localhost:3000/password/reset?id=${user.id}&token=${accessToken}`;
    console.log(link);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log('transporter', transporter);

    const info = await transporter.sendMail({
      from: `L'équipe Xiong Ying Wushu Guan <${process.env.GMAIL_USERNAME}>"`,
      to: process.env.GMAIL_USERNAME,
      subject: 'Xiong ying Wushu Guan - Réinitialisation de votre mot de passe',
      html: `<p>Bonjour, vous avez souhaité réinitialiser votre mot de passe.</p> <p>Veuillez cliquer sur le lien ci-dessous pour en créer un nouveau :</p> <a href='${link}'>Réinitialiser</a> <p>A bientôt sur notre application,</p> <p>Xiong ying WusguGuan</p>`,
    });
    console.log('info', info);

    const response = info.messageId;
    console.log('Message sent : %s', response);
    return response;
  }

  async resetPassword(
    id: string,
    token: string,
    resetPasswordDto: ResetPasswordDto,
  ) {
    console.log('id : ', id);
    console.log('token : ', token);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Cet utilisateur n'existe pas`);
    }
    const { password } = resetPasswordDto;
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!payload || user.id !== payload.sub) {
      throw new ForbiddenException(
        'Identifiants incorrects, veuillez redemander un envoi de mail',
      );
    }
    const salt = await bcrypt.genSalt();
    console.log('génération du salt : ', salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('mot de passe haché : ', hashedPassword);
    user.password = hashedPassword;
    const updatedPasswordUser = await this.userRepository.save(user);
    delete updatedPasswordUser.password;
    return updatedPasswordUser;
  }
}
