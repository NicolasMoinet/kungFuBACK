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
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  create(
    @Body() createBlogDto: CreateBlogDto,
    // On passe le décorateur @GetUser pour récupérer les infos du user qui fait la requête (chez nous, c'est l'organisateur)
    @GetUser() writer: User,
  ) {
    console.log("user qui crée l'article : ", writer);
    if (
      !createBlogDto.title ||
      !createBlogDto.date ||
      !createBlogDto.description
    )
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.blogService.create(createBlogDto, writer);
  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @GetUser() connectedUser: User,
  ) {
    if (
      !updateBlogDto.title &&
      !updateBlogDto.date &&
      !updateBlogDto.description &&
      !updateBlogDto.picture
    )
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    return this.blogService.update(id, updateBlogDto, connectedUser);
  }

  @Delete(':id')
  // on passe AuthGuard (le middleware) à ce controller pour vérifier si le user est connecté
  @UseGuards(AuthGuard())
  remove(@Param('id') id: string, @GetUser() connectedUser: User) {
    console.log(id);
    return this.blogService.remove(id, connectedUser);
  }
}
