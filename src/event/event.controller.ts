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
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('events')
export class EventController {
  constructor(private readonly eventsService: EventService) {}

  @Post()
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseInterceptors(FileInterceptor('picture'))
  @UseGuards(AuthGuard())
  create(
    @UploadedFile() picture: Express.Multer.File,
    @Body() body: CreateEventDto,
    @GetUser() organisateur: User,
  ) {
    const events: CreateEventDto = {
      ...body,
      picture: picture.filename,
    };
    console.log('picture/upload : ', picture.filename);
    console.log("user qui crée l'event : ", organisateur);
    console.log('recuperation du create event : ', body);
    // if (
    //   !createEventDto.title ||
    //   !createEventDto.postalCode ||
    //   !createEventDto.city ||
    //   !createEventDto.date ||
    //   !createEventDto.time ||
    //   !createEventDto.description
    // )
    //   throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.eventsService.create(events, organisateur);
  }

  @Get(':filename')
  getFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const file = createReadStream(join(process.cwd(), `./files/${filename}`));
    res.set({
      'Content-Type': 'image/png',
    });
    return new StreamableFile(file);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('/one/:id')
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
    // if (
    //   !updateEventDto.title &&
    //   !updateEventDto.address &&
    //   !updateEventDto.postalCode &&
    //   !updateEventDto.city &&
    //   !updateEventDto.date &&
    //   !updateEventDto.time &&
    //   !updateEventDto.description &&
    //   !updateEventDto.participants
    // )
    //   throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.eventsService.update(id, updateEventDto, connectedUser);
  }

  @Delete(':id')
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string, @GetUser() connectedUser: User) {
    return this.eventsService.remove(id, connectedUser);
  }
}
