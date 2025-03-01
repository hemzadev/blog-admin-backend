export interface ITokenService {
    createAccessToken(user: any): Promise<string>;
    createRefreshToken(user: any, deviceId: string): Promise<string>;
    verifyAccessToken(token: string): Promise<any>;
    verifyRefreshToken(token: string): Promise<any>;
}