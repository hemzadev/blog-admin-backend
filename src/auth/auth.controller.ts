import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Body,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface DecodedToken {
  exp: number;
  sub: string;
  deviceId: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

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

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<SocialLoginResponseDto> {
    const deviceId = req.headers['device-id'] as string;
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }
    return this.authService.register(createUserDto, deviceId);
  }

  @Post('login/user')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<SocialLoginResponseDto> {
    const deviceId = req.headers['device-id'] as string;
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.generateTokens(user, deviceId);
  }

  @Post('login/admin')
  async loginAdmin(
    @Body() loginAdminDto: LoginAdminDto,
    @Req() req: Request,
  ): Promise<SocialLoginResponseDto> {
    const deviceId = req.headers['device-id'] as string;
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    const admin = await this.authService.validateAdmin(loginAdminDto.email, loginAdminDto.password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const adminPayload = {
      ...admin,
      newsletterSubscribed: false,
      socialProvider: null,
      socialProviderId: null,
      lastSeen: new Date(),
      isActive: true,
      role: admin.role,
      name: admin.name,
      password: admin.password
    };

    const adminPayloadWithDefaults = {
      ...adminPayload,
      devicePreference: null,
      trafficSource: null,
      totalSessionTime: 0,
      totalPageViews: 0
    };

    return this.authService.generateTokens(adminPayloadWithDefaults, deviceId);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const decoded = this.jwtService.decode(
      req.cookies.refresh_token,
    ) as DecodedToken;

    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    const { sub, deviceId } = decoded;
    const refreshToken = req.cookies.refresh_token;

    const tokens = await this.authService.refreshTokens(sub, deviceId, refreshToken);

    // Update the refresh token cookie if a new one was generated
    if (tokens.refreshToken !== refreshToken) {
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: (this.configService.get<number>('JWT_REFRESH_EXPIRATION') ?? 0) * 1000,
      });
    }

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request): Promise<void> {
    const decoded = this.jwtService.decode(
      req.cookies.refresh_token,
    ) as DecodedToken;

    if (!decoded) {
      throw new UnauthorizedException('Invalid token');
    }

    const { sub, deviceId } = decoded;
    await this.authService.logout(sub, deviceId);
  }
}