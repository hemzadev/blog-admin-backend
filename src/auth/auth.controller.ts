import {
    Controller,
    Get,
    Req,
    UseGuards,
    Redirect
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { AuthService } from './auth.service';
  import { SocialLoginResponseDto } from './dto/social-login-response.dto';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Get('google') // <-- This was missing in your implementation
    @UseGuards(AuthGuard('google'))
    googleLogin() {
      // Initiates the Google OAuth flow
    }
  
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req): Promise<SocialLoginResponseDto> {
      return this.authService.handleSocialUser(req.user);
    }

    @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordAuth() {}

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Req() req): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req): Promise<SocialLoginResponseDto> {
    return this.authService.handleSocialUser(req.user);
  }

  @Get('x')
  @UseGuards(AuthGuard('x'))
  xAuth() {}

  @Get('x/callback')
  @UseGuards(AuthGuard('x'))
  async xCallback(@Req() req): Promise<SocialLoginResponseDto> {
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
}