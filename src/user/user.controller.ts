import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RoleEnumType, User } from './entities/user.entity';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('users')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnumType.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Get('events/participant/:id')
  findParticipatedEvents(@Param('id') userId: string) {
    return this.usersService.findParticipatedEvents(userId);
  }

  @Get('events/organisateur/:id')
  findCreatedEvents(@Param('id') userId: string) {
    return this.usersService.findCreatedEvents(userId);
  }

  @Patch(':email')
  update(
    @Param('email') mail: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() connectedUser: User,
  ) {
    if (
      !updateUserDto.email &&
      !updateUserDto.password &&
      !updateUserDto.name &&
      !updateUserDto.role
    )
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.usersService.patch(mail, updateUserDto, connectedUser);
  }

  @Delete(':email')
  @UseGuards(RolesGuard)
  @Roles(RoleEnumType.ADMIN)
  remove(@Param('email') email: string) {
    return this.usersService.remove(email);
  }
}
