import {
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}
  async create(
    createEventDto: CreateEventDto,
    organisateur: User,
  ): Promise<Event> {
    // On intègre l'organisateur à notre event créé
    const eventEnCoursDeCreation = {
      ...createEventDto,
      organisateur,
    };
    return await this.eventRepository.save(eventEnCoursDeCreation);
  }

  async findAll(): Promise<Event[]> {
    return await this.eventRepository.find();
  }

  async findOne(id: string): Promise<Event> {
    const eventFound = await this.eventRepository.findOneBy({ id });
    if (!eventFound) {
      throw new NotFoundException(`pas d'event avec l'id : ${id}`);
    }
    return eventFound;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    connectedUser: User,
  ): Promise<Event> {
    const upEvent = await this.findOne(id);
    const {
      title,
      address,
      postalCode,
      city,
      date,
      time,
      description,
      participants,
    } = updateEventDto;

    if (!participants && upEvent.organisateur.id !== connectedUser.id) {
      throw new MethodNotAllowedException(
        `Vous ne pouvez pas modifier un évènement que vous n'avez pas créé`,
      );
    }

    if (participants && upEvent.organisateur.id === connectedUser.id) {
      throw new MethodNotAllowedException(
        `Un utilisateur ne peut pas s'inscrire à un évènement qu'il a créé`,
      );
    }

    if (
      participants &&
      participants.some((participant) => participant.id === connectedUser.id)
    ) {
      throw new MethodNotAllowedException(
        `Un utilisateur ne peut pas s'inscrire à un évènement auquel il participe déjà`,
      );
    }

    upEvent.title = title;
    upEvent.address = address;
    upEvent.postalCode = postalCode;
    upEvent.city = city;
    upEvent.date = date;
    upEvent.time = time;
    upEvent.description = description;
    upEvent.participants = participants;
    if (!upEvent) {
      throw new NotFoundException(`pas d'event avec l'id : ${id}`);
    }

    return await this.eventRepository.save(upEvent);
  }

  async remove(id: string, connectedUser: User): Promise<string> {
    const eventToDelete = await this.findOne(id);

    if (
      eventToDelete.organisateur.id !== connectedUser.id &&
      connectedUser.role !== 'admin'
    ) {
      throw new MethodNotAllowedException(
        `Vous ne pouvez pas supprimer un évènement que vous n'avez pas créé`,
      );
    }

    const result = await this.eventRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`pas d'event a le nom : ${id}`);
    }
    return `This action removes a #${id} event`;
  }
}
