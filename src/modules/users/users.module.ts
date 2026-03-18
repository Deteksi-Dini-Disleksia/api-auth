import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DatabaseService } from '../../shared/database/database.service';

@Module({
  providers: [UsersService, UsersRepository, DatabaseService],
  exports: [UsersService],
})
export class UsersModule {}
