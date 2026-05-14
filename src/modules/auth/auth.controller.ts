import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponseUtil } from '../../common/response/api-response';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(private readonly authService: AuthService) {
    if (!process.env.FRONTEND_URL) {
      throw new Error('Missing required environment variable: FRONTEND_URL');
    }
    this.frontendUrl = process.env.FRONTEND_URL;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ApiResponseUtil.success(result, result.message);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(token);
      res.redirect(`${this.frontendUrl}/login?verified=true`);
    } catch {
      res.redirect(`${this.frontendUrl}/login?verified=false`);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return ApiResponseUtil.success(tokens, 'Login successful');
  }

  @Post('refresh')
  async refresh(
    @Body()
    body: {
      refresh_token: string;
    },
  ) {
    const tokens = await this.authService.refresh_token(body.refresh_token);
    return ApiResponseUtil.success(tokens, 'Token refreshed successfully');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return ApiResponseUtil.success(result, result.message);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return ApiResponseUtil.success(result, result.message);
  }
}
