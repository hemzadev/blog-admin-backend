// src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginAdminDto) {
    const admin = await this.auth.validateAdmin(dto.email, dto.password);
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    return this.auth.generateTokens(admin);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req) {
    return this.handleSocialLogin(req.user);
  }

  private async handleSocialLogin(profile: any) {
    // Implementation to create/update user
  }
}