import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';  // Make sure this is imported

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordAuth() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('x')
  @UseGuards(AuthGuard('x'))
  xAuth() {}

  @Get('x/callback')
  @UseGuards(AuthGuard('x'))
  async xCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('session-test')
  testSession(@Req() req: Request) {
    req.session.testValue = Date.now(); 
    return { status: 'Session value set' };
  }

  @Get('session-validate')
  validateSession(@Req() req: Request) {
    return { sessionValue: req.session.testValue };
  }
  
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
  const user = await this.authService.register(createUserDto);
    return this.authService.generateTokens(user);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req) {
    return this.authService.generateTokens(req.user);
  }
}
