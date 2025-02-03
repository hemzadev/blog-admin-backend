// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginAdminDto) {
    const admin = await this.auth.validateAdmin(dto.email, dto.password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    return this.auth.generateTokens(admin);
  }
}