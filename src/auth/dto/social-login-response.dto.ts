// src/auth/dto/social-login-response.dto.ts
export class SocialLoginResponseDto {
    accessToken: string;
    refreshToken: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }