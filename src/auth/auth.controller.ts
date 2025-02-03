// src/auth/auth.controller.ts
import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    Redirect
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { AuthService } from './auth.service';
  import { LoginAdminDto } from './dto/login-admin.dto';
  import { UnauthorizedException } from '@nestjs/common';
  
  @Controller('auth')
  export class AuthController {
    constructor(private auth: AuthService) {}
  
    @Post('login')
    async adminLogin(@Body() dto: LoginAdminDto) {
      const admin = await this.auth.validateAdmin(dto.email, dto.password);
      if (!admin) throw new UnauthorizedException('Invalid credentials');
      return this.auth.generateTokens(admin);
    }
  
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {}
  
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @Redirect() // Add proper redirect handling
    async googleCallback(@Req() req) {
      const tokens = await this.auth.handleSocialUser(req.user);
      return { url: `/auth/success?access_token=${tokens.accessToken}` };
    }
  
    private async handleSocialLogin(profile: any) {
      return this.auth.handleSocialUser(profile);
    }
  }