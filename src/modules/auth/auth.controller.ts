import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponseUtil } from '../../common/response/api-response';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ApiResponseUtil.success(result, result.message);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      await this.authService.verifyEmail(token);
      res.redirect(`${frontendUrl}/login?verified=true`);
    } catch {
      res.redirect(`${frontendUrl}/login?verified=false`);
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
}
