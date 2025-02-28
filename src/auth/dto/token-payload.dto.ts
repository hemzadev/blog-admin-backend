export class TokenPayloadDto {
    sub: string; // Always use string for consistency
    email: string;
    deviceId?: string;
}