import { Prisma } from '@prisma/client';
import UserService from './services/UserService';

export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      REDIS_URL: string;
      JWT_SECRET: string;
    }
  }

  interface User
    extends Prisma.UserGetPayload<{
      select: {
        id: true;
        email: true;
        UserRole: true;
        UserInformation: {
          select: {
            displayName: true;
            gender: true;
          };
        };
      };
    }> {}

  interface OptionsWithRevalidate {
    revalidate?: boolean;
  }
}
