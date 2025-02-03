// src/auth/dto/social-login-response.dto.ts
export class SocialLoginResponseDto {
    accessToken: string;
    refreshToken: string;
    email: string;
    name: string;
    avatar?: string;
  }