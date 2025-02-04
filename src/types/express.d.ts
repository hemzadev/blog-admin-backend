import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    testValue?: number;
    passport?: {
      user: any;
    };
  }
}

declare module 'express' {
  interface Request {
    session: SessionData;
  }
}