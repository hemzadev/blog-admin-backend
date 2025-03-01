// src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client'; // Import the Prisma-generated User type

interface DecodedToken {
  exp: number;
  sub: string;
  deviceId: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    this.logger.debug('Initiating Google OAuth flow');
    // Passport handles the redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    this.logger.debug('Processing Google OAuth callback');
    return this.authService.handleSocialUser(req.user);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordAuth() {
    this.logger.debug('Initiating Discord OAuth flow');
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    this.logger.debug('Processing Discord OAuth callback');
    return this.authService.handleSocialUser(req.user);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    this.logger.debug('Initiating GitHub OAuth flow');
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    this.logger.debug('Processing GitHub OAuth callback');
    return this.authService.handleSocialUser(req.user);
  }

  @Get('x')
  @UseGuards(AuthGuard('x'))
  xAuth() {
    this.logger.debug('Initiating X OAuth flow');
  }

  @Get('x/callback')
  @UseGuards(AuthGuard('x'))
  async xCallback(@Req() req: Request): Promise<SocialLoginResponseDto> {
    this.logger.debug('Processing X OAuth callback');
    return this.authService.handleSocialUser(req.user);
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<SocialLoginResponseDto> {
    try {
      this.logger.debug(`Registering user: ${createUserDto.email}`);
      const deviceId = req.headers['x-device-id'] as string || `web-${Date.now()}`;
      return await this.authService.register(createUserDto, deviceId);
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<SocialLoginResponseDto> {
    try {
      this.logger.debug(`User login attempt: ${loginUserDto.email}`);
      const deviceId = req.headers['x-device-id'] as string || `web-${Date.now()}`;
      const user = req.user as User; // Cast to Prisma's User type
      
      if (!user) {
        this.logger.warn(`Login failed: No user found for ${loginUserDto.email}`);
        throw new UnauthorizedException('Authentication failed');
      }
      
      return await this.authService.generateTokens(user, deviceId);
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginAdminDto: LoginAdminDto): Promise<{ accessToken: string }> {
    try {
      this.logger.debug(`Admin login attempt: ${loginAdminDto.email}`);
      const admin = await this.authService.validateAdmin(
        loginAdminDto.email,
        loginAdminDto.password,
      );
  
      if (!admin) {
        this.logger.warn(`Admin login failed: ${loginAdminDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Use the new method instead
      const accessToken = await this.authService.createAdminAccessToken(admin);
      return { accessToken };
    } catch (error) {
      this.logger.error(`Admin login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: Request): Promise<SocialLoginResponseDto> {
    try {
      const deviceId = req.headers['x-device-id'] as string;
      const refreshToken = req.headers['authorization']?.split(' ')[1];
      
      if (!deviceId || !refreshToken) {
        this.logger.warn('Refresh token attempt missing deviceId or refreshToken');
        throw new UnauthorizedException('Missing required headers');
      }

      // Extract user ID from JWT payload
      const decodedToken = req.user as DecodedToken;
      const userId = decodedToken.sub;
      
      this.logger.debug(`Refreshing tokens for user: ${userId}`);
      return await this.authService.refreshTokens(userId, deviceId, refreshToken);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    try {
      const deviceId = req.headers['x-device-id'] as string;
      const userId = (req.user as User).id.toString();
      
      this.logger.debug(`Logging out user: ${userId} from device: ${deviceId}`);
      
      if (!deviceId) {
        this.logger.warn(`Logout attempt without deviceId for user: ${userId}`);
        throw new UnauthorizedException('Device ID is required');
      }
      
      await this.authService.logout(userId, deviceId);
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@Req() req: Request): Promise<void> {
    try {
      const userId = (req.user as User).id.toString();
      this.logger.debug(`Logging out user: ${userId} from all devices`);
      await this.authService.logoutAll(userId);
    } catch (error) {
      this.logger.error(`Logout from all devices failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; details: any }> {
    this.logger.debug('Auth service health check requested');
    return this.authService.checkHealth();
  }
}