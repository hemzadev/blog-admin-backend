import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createAccessToken(user: User): Promise<string> {
    const payload: TokenPayloadDto = { sub: user.id.toString(), email: user.email }; // Convert to string
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
    });
  }

  async createRefreshToken(user: User, deviceId: string): Promise<string> {
    const payload: TokenPayloadDto = { sub: user.id.toString(), email: user.email, deviceId }; // Convert to string
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    });
  }
}