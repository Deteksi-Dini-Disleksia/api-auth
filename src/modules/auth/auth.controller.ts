import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiResponseUtil } from '../../common/response/api-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return ApiResponseUtil.success(user, 'Registration successful');
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
      user_id: number;
      device_type: string;
      refresh_token: string;
    },
  ) {
    const tokens = await this.authService.refresh_token(
      body.user_id,
      body.device_type,
      body.refresh_token,
    );
    return ApiResponseUtil.success(tokens, 'Token refreshed successfully');
  }
}
