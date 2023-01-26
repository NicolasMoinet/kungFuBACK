import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { BlogModule } from './blog/blog.module';
import { Event } from './event/entities/event.entity';
import { User } from './user/entities/user.entity';
import { Blog } from './blog/entities/blog.entity';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

@Module({
  imports: [UserModule, EventModule, BlogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
