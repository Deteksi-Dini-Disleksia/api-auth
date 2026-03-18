import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';
import { DatabaseService } from '../../shared/database/database.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_KEY || 'changeme',
      signOptions: { expiresIn: '10m' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, DatabaseService],
})
export class AuthModule {}
