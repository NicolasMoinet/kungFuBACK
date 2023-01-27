import {
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(email: string): Promise<User> {
    const userFound = await this.usersRepository.findOneBy({ email });
    if (!userFound) {
      throw new NotFoundException(`pas d'utilisateur avec l'email : ${email}`);
    }
    return userFound;
  }

  async findParticipatedEvents(userId: string): Promise<Event[]> {
    // On vérifie d'abord si le user existe
    const userFound = await this.usersRepository.findOneBy({ id: userId });
    if (!userFound) {
      throw new NotFoundException(`pas d'utilisateur avec l'id : ${userId}`);
    }

    // Requete (query) custom ave TypeORM parce que je ne savais pas si une méthode existait pour faire ça
    // Pour les custom query, le eager ne fonctionne pas, il faut donc join toutes les tables que l'on souhaite récupérer dans la réponse
    const foundEvents = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('event.organisateur', 'organisateur')
      .where('participants.id = :id', { id: userId })
      .getMany();
    return foundEvents;
  }

  async findCreatedEvents(userId: string): Promise<Event[]> {
    // On vérifie d'abord si le user existe
    const userFound = await this.usersRepository.findOneBy({ id: userId });
    if (!userFound) {
      throw new NotFoundException(`pas d'utilisateur avec l'id : ${userId}`);
    }

    // Requete (query) custom ave TypeORM parce que je ne savais pas si une méthode existait pour faire ça
    // Pour les custom query, le eager ne fonctionne pas, il faut donc join toutes les tables que l'on souhaite récupérer dans la réponse
    const foundEvents = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organisateur', 'organisateur')
      .leftJoinAndSelect('event.participants', 'participants')
      .where('organisateur.id = :id', { id: userId })
      .getMany();
    return foundEvents;
  }

  async patch(
    mail: string,
    updateUserDto: UpdateUserDto,
    connectedUser: User,
  ): Promise<User> {
    const upUser = await this.usersRepository.findOneBy({ email: mail });
    console.log('updated user before update : ', upUser);
    if (!upUser) {
      throw new NotFoundException(`pas d'user avec cet email : ${mail}`);
    }

    if (mail !== connectedUser.email && connectedUser.role !== 'admin') {
      throw new MethodNotAllowedException(
        `Vous ne pouvez pas modifier les informations d'un autre utilisateur`,
      );
    }

    const { email, password, name } = updateUserDto;

    if (password) {
      const salt = await bcrypt.genSalt();
      console.log('génération du salt : ', salt);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('mot de passe haché : ', hashedPassword);
      upUser.password = hashedPassword;
    }
    upUser.email = email;
    upUser.name = name;
    await this.usersRepository.save(upUser);
    const updatedUser = await this.findOne(mail);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(email: string): Promise<string> {
    const result = await this.usersRepository.delete({ email });
    if (result.affected === 0) {
      throw new NotFoundException(`Pas d'utilisateur avec l'email : ${email}`);
    }
    return `l'utilisateur avec l'email #${email} a disparu ! :o`;
  }
}
