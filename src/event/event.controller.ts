import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('events')
export class EventController {
  constructor(private readonly eventsService: EventService) {}

  @Post()
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  create(
    @Body() createEventDto: CreateEventDto,
    // On passe le décorateur @GetUser pour récupérer les infos du user qui fait la requête (chez nous, c'est l'organisateur)
    @GetUser() organisateur: User,
  ) {
    console.log("user qui crée l'event : ", organisateur);
    if (
      !createEventDto.title ||
      !createEventDto.postalCode ||
      !createEventDto.city ||
      !createEventDto.date ||
      !createEventDto.time ||
      !createEventDto.description
    )
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.eventsService.create(createEventDto, organisateur);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() connectedUser: User,
  ) {
    if (
      !updateEventDto.title &&
      !updateEventDto.address &&
      !updateEventDto.postalCode &&
      !updateEventDto.city &&
      !updateEventDto.date &&
      !updateEventDto.time &&
      !updateEventDto.description &&
      !updateEventDto.participants
    )
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.eventsService.update(id, updateEventDto, connectedUser);
  }

  @Delete(':id')
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string, @GetUser() connectedUser: User) {
    return this.eventsService.remove(id, connectedUser);
  }
}
