import { Injectable } from '@nestjs/common';
import { UsersRepository, User } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  async findById(user_id: number): Promise<User | null> {
    return this.usersRepository.findById(user_id);
  }

  async create(
    username: string,
    password: string,
    fullname: string,
    role: string,
  ): Promise<User> {
    return this.usersRepository.create(username, password, fullname, role);
  }

  async updatePassword(user_id: number, hashedPassword: string): Promise<void> {
    return this.usersRepository.updatePassword(user_id, hashedPassword);
  }
}
