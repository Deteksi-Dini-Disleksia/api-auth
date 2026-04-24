import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../shared/database/database.service';
import { EmailService } from '../../shared/email/email.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { PendingUsersRepository } from './pending-users.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        if (!process.env.ACCESS_TOKEN_KEY) {
          throw new Error(
            'Missing required environment variable: ACCESS_TOKEN_KEY',
          );
        }
        return {
          secret: process.env.ACCESS_TOKEN_KEY,
          signOptions: { expiresIn: '10m' },
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    PendingUsersRepository,
    DatabaseService,
    EmailService,
  ],
})
export class AuthModule {}
