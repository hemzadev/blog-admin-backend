export interface IRefreshTokenService {
    storeRefreshToken(userId: string, deviceId: string, token: string): Promise<void>;
    validateRefreshToken(userId: string, deviceId: string, token: string): Promise<boolean>;
    deleteRefreshToken(userId: string, deviceId: string): Promise<void>;
    deleteAllRefreshTokens(userId: string): Promise<void>;
}