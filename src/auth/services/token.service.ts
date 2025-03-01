// src/auth/services/token.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { ITokenService } from '../interfaces/token.interface';
import { AUTH_CONFIG } from '../constants/config.constants';

@Injectable()
export class TokenService implements ITokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createAccessToken(user: User): Promise<string> {
    try {
      const accessSecret = this.configService.get<string>(AUTH_CONFIG.JWT_ACCESS_SECRET);
      const accessExpiration = this.configService.get<string>(AUTH_CONFIG.JWT_ACCESS_EXPIRATION);
      
      if (!accessSecret || !accessExpiration) {
        this.logger.error('JWT access token configuration is missing');
        throw new Error('JWT configuration is incomplete');
      }
      
      const payload: TokenPayloadDto = { 
        sub: user.id.toString(), 
        email: user.email 
      };
      
      const token = await this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiration,
      });
      
      this.logger.debug(`Access token created for user ${user.id}`);
      return token;
    } catch (error) {
      this.logger.error(`Error creating access token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createRefreshToken(user: User, deviceId: string): Promise<string> {
    try {
      const refreshSecret = this.configService.get<string>(AUTH_CONFIG.JWT_REFRESH_SECRET);
      const refreshExpiration = this.configService.get<string>(AUTH_CONFIG.JWT_REFRESH_EXPIRATION);
      
      if (!refreshSecret || !refreshExpiration) {
        this.logger.error('JWT refresh token configuration is missing');
        throw new Error('JWT configuration is incomplete');
      }
      
      const payload: TokenPayloadDto = { 
        sub: user.id.toString(), 
        email: user.email, 
        deviceId 
      };
      
      const token = await this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration,
      });
      
      this.logger.debug(`Refresh token created for user ${user.id} on device ${deviceId}`);
      return token;
    } catch (error) {
      this.logger.error(`Error creating refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyAccessToken(token: string): Promise<any> {
    try {
      const accessSecret = this.configService.get<string>(AUTH_CONFIG.JWT_ACCESS_SECRET);
      
      if (!accessSecret) {
        this.logger.error('JWT access token secret is missing');
        throw new Error('JWT configuration is incomplete');
      }
      
      const payload = await this.jwtService.verifyAsync(token, {
        secret: accessSecret,
      });
      
      this.logger.debug(`Access token verified for user ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`Error verifying access token: ${error.message}`);
      throw error;
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const refreshSecret = this.configService.get<string>(AUTH_CONFIG.JWT_REFRESH_SECRET);
      
      if (!refreshSecret) {
        this.logger.error('JWT refresh token secret is missing');
        throw new Error('JWT configuration is incomplete');
      }
      
      const payload = await this.jwtService.verifyAsync(token, {
        secret: refreshSecret,
      });
      
      this.logger.debug(`Refresh token verified for user ${payload.sub}`);
      return payload;
    } catch (error) {
      this.logger.error(`Error verifying refresh token: ${error.message}`);
      throw error;
    }
  }
}