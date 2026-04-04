import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { JwtSignOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    user_id: number;
    username: string;
    fullname: string;
    role: string;
  }> {
    const existing = await this.usersService.findByUsername(dto.username);
    if (existing) {
      throw new BadRequestException('Username already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(
      dto.username,
      hashedPassword,
      dto.fullname,
      dto.role,
    );

    return {
      user_id: user.user_id,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
    };
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.generateaccess_token(
      user.user_id,
      user.username,
      user.role,
      dto.device_type,
    );
    const refresh_token = this.generaterefresh_token(
      user.user_id,
      user.username,
      user.role,
      dto.device_type,
    );

    const expiryDate = this.calculaterefresh_tokenExpiry();
    await this.authRepository.saveToken(
      user.user_id,
      refresh_token,
      dto.device_type,
      expiryDate,
    );

    const expiresIn = this.getaccess_tokenExpirySeconds(dto.device_type);
    return new TokenResponseDto(access_token, refresh_token, expiresIn);
  }

  async refresh_token(
    user_id: number,
    device_type: string,
    refresh_token: string,
  ): Promise<TokenResponseDto> {
    const stored = await this.authRepository.getToken(user_id, device_type);
    if (!stored || stored.token !== refresh_token) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    try {
      const payload = this.jwtService.verify<TokenPayload>(refresh_token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      if (payload.sub !== user_id) {
        throw new UnauthorizedException('Refresh token is invalid');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.usersService.findById(user_id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const access_token = this.generateaccess_token(
      user.user_id,
      user.username,
      user.role,
      device_type,
    );
    const newrefresh_token = this.generaterefresh_token(
      user.user_id,
      user.username,
      user.role,
      device_type,
    );

    const expiryDate = this.calculaterefresh_tokenExpiry();
    await this.authRepository.saveToken(
      user.user_id,
      newrefresh_token,
      device_type,
      expiryDate,
    );

    const expiresIn = this.getaccess_tokenExpirySeconds(device_type);
    return new TokenResponseDto(access_token, newrefresh_token, expiresIn);
  }

  private generateaccess_token(
    user_id: number,
    username: string,
    role: string,
    device_type: string,
  ): string {
    const expiresIn = this.getaccess_tokenExpiry(device_type);
    const payload: TokenPayload = {
      sub: user_id,
      username,
      role,
      device_type,
    };

    const options: JwtSignOptions = {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: expiresIn,
    };

    return this.jwtService.sign(payload, options);
  }

  private generaterefresh_token(
    user_id: number,
    username: string,
    role: string,
    device_type: string,
  ): string {
    const payload: TokenPayload = {
      sub: user_id,
      username,
      role,
      device_type,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY as string,
      expiresIn: '30d',
    });
  }

  private getaccess_tokenExpiry(device_type: string): StringValue {
    const value =
      device_type === 'MOBILE'
        ? process.env.ACCESS_TOKEN_AGE_MOBILE || '1d'
        : process.env.ACCESS_TOKEN_AGE_WEB || '10m';

    return value as StringValue;
  }

  private getaccess_tokenExpirySeconds(device_type: string): number {
    const tokenExpiry = this.getaccess_tokenExpiry(device_type);
    const match = tokenExpiry.match(/^(\d+)([smhd])$/);
    if (!match) return 0;

    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 0;
    }
  }

  private calculaterefresh_tokenExpiry(): Date {
    const expirySeconds = 30 * 24 * 60 * 60; // 30 days
    return new Date(Date.now() + expirySeconds * 1000);
  }
}
