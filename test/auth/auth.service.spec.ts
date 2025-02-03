// test/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  const mockAdmin = {
    id: 1,
    email: 'admin@example.com',
    password: 'hashed_password',
    role: 'OWNER'
  };

  const mockUser = {
    id: 2,
    email: 'user@example.com',
    name: 'Test User',
    avatar: 'avatar.jpg',
    socialProvider: 'google',
    socialProviderId: '12345'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
            },
            user: {
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock_token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'JWT_ACCESS_SECRET':
                  return 'access_secret';
                case 'JWT_REFRESH_SECRET':
                  return 'refresh_secret';
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
  });

  describe('validateAdmin', () => {
    it('should return admin when credentials are valid', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateAdmin('admin@example.com', 'password');
      expect(result).toEqual(mockAdmin);
    });

    it('should return null when admin not found', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.validateAdmin('wrong@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateAdmin('admin@example.com', 'wrong_password');
      expect(result).toBeNull();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const tokens = await service.generateTokens(mockAdmin);
      expect(tokens).toEqual({
        accessToken: 'mock_token',
        refreshToken: 'mock_token'
      });
      expect(jwt.signAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleSocialUser', () => {
    const socialProfile = {
      email: 'user@example.com',
      provider: 'google',
      providerId: '12345',
      firstName: 'Test',
      lastName: 'User',
      picture: 'avatar.jpg'
    };

    it('should create new user when not exists', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.handleSocialUser(socialProfile);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
        update: {
          lastSeen: expect.any(Date),
          avatar: 'avatar.jpg',
          socialProvider: 'google',
          socialProviderId: '12345'
        },
        create: {
          email: 'user@example.com',
          name: 'Test User',
          avatar: 'avatar.jpg',
          socialProvider: 'google',
          socialProviderId: '12345'
        }
      });
      expect(result).toEqual({
        accessToken: 'mock_token',
        refreshToken: 'mock_token'
      });
    });

    it('should update existing user', async () => {
      (prisma.user.upsert as jest.Mock).mockResolvedValue({
        ...mockUser,
        lastSeen: new Date()
      });

      const result = await service.handleSocialUser(socialProfile);
      expect(prisma.user.upsert).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
    });
  });
});