import {
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}
  async create(createBlogDto: CreateBlogDto, writer: User): Promise<Blog> {
    // On intègre le writer à notre article créé
    const articleEnCoursDeCreation = {
      ...createBlogDto,
      writer,
    };
    return await this.blogRepository.save(articleEnCoursDeCreation);
  }

  async findAll(): Promise<Blog[]> {
    return await this.blogRepository.find();
  }

  async findOne(id: string): Promise<Blog> {
    const blogFound = await this.blogRepository.findOneBy({ id });
    if (!blogFound) {
      throw new NotFoundException(`pas d'article avec l'id : ${id}`);
    }
    return blogFound;
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    connectedUser: User,
  ): Promise<Blog> {
    const upBlog = await this.findOne(id);
    const { title, date, description, picture } = updateBlogDto;

    if (!connectedUser && upBlog.writer.id !== connectedUser.id) {
      throw new UnauthorizedException(
        `Vous ne pouvez pas modifier un article que vous n'avez pas créé`,
      );
    }

    upBlog.title = title;
    upBlog.date = date;
    upBlog.description = description;
    upBlog.picture = picture;
    if (!upBlog) {
      throw new NotFoundException(`pas d'article avec l'id : ${id}`);
    }

    return await this.blogRepository.save(upBlog);
  }

  async remove(id: string, connectedUser: User): Promise<string> {
    const blogToDelete = await this.findOne(id);

    if (
      // blogToDelete.writer.id !== connectedUser.id &&
      connectedUser.role !== 'admin'
    ) {
      throw new UnauthorizedException(
        `Vous ne pouvez pas supprimer un article que vous n'avez pas créé`,
      );
    }

    const result = await this.blogRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`pas d'article qui a le nom : ${id}`);
    }
    return `This action removes a #${id} article`;
  }
}
