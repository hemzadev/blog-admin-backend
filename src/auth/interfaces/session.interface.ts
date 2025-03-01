export interface ISessionService {
    setStore(store: any, options: any): void;
    getStoreType(): string;
    checkStoreAvailability(): Promise<boolean>;
    getActiveSessionCount(): Promise<number>;
}