import { Prisma } from '@prisma/client';
import { Conflict, NotFound, Unauthorized } from 'http-errors';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import prismaClient from '../plugins/prismaClient';
import CacheService from './CacheService';

const MS_5MINS = 5 * 60 * 1000;

export default class UserService {
  constructor(private readonly cacheService: CacheService) {}

  public async registerUser(
    email: string,
    password?: string,
    userInformation?: Prisma.UserInformationGetPayload<{
      select: {
        displayName: true;
        gender: true;
      };
    }>,
  ): Promise<User> {
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) throw new Conflict('email already used');

    if (password === undefined) {
      const user = await prismaClient.user.create({
        data: {
          email,
        },
        select: {
          id: true,
        },
      });

      return await this.getUserByIdOrThrow(user.id);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const saltedPassword = crypto
      .scryptSync(password, salt, 64)
      .toString('hex');
    const user = await prismaClient.user.create({
      data: {
        email,
        UserAuthLocal: {
          create: {
            password: saltedPassword,
            salt,
          },
        },
        UserInformation: {
          create: userInformation,
        },
      },
      select: {
        id: true,
      },
    });

    return await this.getUserByIdOrThrow(user.id);
  }

  public async loginUser(email: string, password?: string): Promise<User> {
    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        UserRole: true,
        UserAuthLocal: {
          select: {
            password: true,
            salt: true,
          },
        },
        UserInformation: {
          select: {
            displayName: true,
            gender: true,
          },
        },
      },
    });

    if (!user) throw new Unauthorized('email is not registered');

    if (password !== undefined) {
      if (!user.UserAuthLocal) {
        throw new Unauthorized('password authentication is not available');
      }

      const salt = user.UserAuthLocal.salt;
      const saltedPassword = crypto
        .scryptSync(password, salt, 64)
        .toString('hex');

      if (user.UserAuthLocal.password !== saltedPassword) {
        throw new Unauthorized('password is incorrect');
      }
    }

    if (user) {
      delete (user as User & Record<string, unknown>).credentialsStrategy;
    }

    return user;
  }

  public async createUserToken(user: User): Promise<string> {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    await this.cacheService.set(`user:[ref:token]:${token}`, user.id, MS_5MINS);
    return token;
  }

  public async logoutUser(token: string): Promise<string> {
    await this.getUserByTokenOrThrow(token);
    await this.cacheService.del(`user:[ref:token]:${token}`);
    return token;
  }

  public async getUserById(
    id: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User | null> {
    const cacheKey = `user:[ref:id]:${id}`;

    if (options.revalidate === true) await this.cacheService.del(cacheKey);

    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser !== undefined) return cachedUser;

    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        UserRole: true,
        UserInformation: {
          select: {
            displayName: true,
            gender: true,
          },
        },
      },
    });

    await this.cacheService.set(cacheKey, user, MS_5MINS);
    return user;
  }

  public async getUserByIdOrThrow(
    id: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User> {
    const user = await this.getUserById(id, options);
    if (!user) throw new NotFound('user not found');
    return user;
  }

  public async getUserByEmail(
    email: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User | null> {
    const cacheKey = `user:[ref:email]:${email}`;

    if (options.revalidate === true) await this.cacheService.del(cacheKey);

    const userId = await this.cacheService.get<string>(cacheKey);
    if (userId !== undefined) return await this.getUserById(userId);

    const user = await prismaClient.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    await this.cacheService.set(cacheKey, user?.id, MS_5MINS);

    if (!user) return user;
    return await this.getUserById(user.id, options);
  }

  public async getUserByEmailOrThrow(
    email: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User> {
    const user = await this.getUserByEmail(email, options);
    if (!user) throw new NotFound('user not found');
    return user;
  }

  public async getUserByToken(
    token: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User | null> {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
    const cacheKey = `user:[ref:token]:${token}`;
    const userId = await this.cacheService.get<string>(cacheKey);

    if (userId === undefined) return null;

    return await this.getUserById(userId, options);
  }

  public async getUserByTokenOrThrow(
    token: string,
    options: {} & OptionsWithRevalidate = {},
  ): Promise<User> {
    const user = await this.getUserByToken(token, options);
    if (!user) throw new NotFound('user not found');
    return user;
  }
}
