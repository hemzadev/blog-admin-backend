// src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
        ignoreExpiration: false,
        passReqToCallback: true,
      });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.headers['authorization'].split(' ')[1];
    return { ...payload, refreshToken };
  }
}