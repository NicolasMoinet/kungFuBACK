import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import * as dotenv from 'dotenv';
import { User } from './user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event/entities/event.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { BlogModule } from './blog/blog.module';
import { Blog } from './blog/entities/blog.entity';
import passport from 'passport';
import { PassportModule } from '@nestjs/passport';

dotenv.config({ path: '.env' });
@Module({
  imports: [
    ServeStaticModule.forRoot({
      // permet de gérer les fichiers statics (images) comme avec express.static
      rootPath: join(__dirname, '..', 'public/assets'),
      serveRoot: '/public/assets/',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [User, Event, Blog],
      synchronize: process.env.MODE === 'DEV' ? true : false,
    }),
    UserModule,
    EventModule,
    BlogModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
