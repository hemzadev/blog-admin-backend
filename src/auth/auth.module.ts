// src/auth/auth.module.ts
import { Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

// Controllers
import { AuthController } from './auth.controller';

// Services
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { SessionModule } from '../session/session.module';
import { SessionService } from '../session/session.service';

// Strategies
import { GoogleStrategy } from './strategies/google.strategy';
import { DiscordStrategy } from './strategies/discord.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { XStrategy } from './strategies/x.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

// Interfaces
import { ITokenService } from './interfaces/token.interface';
import { IRefreshTokenService } from './interfaces/refresh-token.interface';
import { ISessionService } from './interfaces/session.interface';

// External modules
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';

// Constants
import { AUTH_CONFIG } from './constants/config.constants';
import { TOKEN_SERVICE, REFRESH_TOKEN_SERVICE, SESSION_SERVICE } from './constants/provider.constants';

// Providers configuration
const serviceProviders: Provider[] = [
  {
    provide: TOKEN_SERVICE,
    useClass: TokenService,
  },
  {
    provide: REFRESH_TOKEN_SERVICE,
    useClass: RefreshTokenService,
  },
  {
    provide: SESSION_SERVICE,
    useClass: SessionService,
  },
];

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(AUTH_CONFIG.JWT_ACCESS_SECRET),
        signOptions: { 
          expiresIn: config.get<string>(AUTH_CONFIG.JWT_ACCESS_EXPIRATION) || '15m' 
        },
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    RedisModule,
    CacheModule.register(),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...serviceProviders,
    GoogleStrategy,
    DiscordStrategy,
    GithubStrategy,
    XStrategy,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}