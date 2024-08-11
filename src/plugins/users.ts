import redisStore from '@jmrl23/redis-store';
import { caching } from 'cache-manager';
import fastifyPlugin from 'fastify-plugin';
import CacheService from '../services/CacheService';
import UserService from '../services/UserService';

declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService;
  }

  interface FastifyRequest {
    user: User | null;
  }
}

export default fastifyPlugin(async function userService(app) {
  const store = redisStore({
    url: process.env.REDIS_URL,
    prefix: 'PassportLocalJwt:UserService',
  });
  const cache = await caching(store);
  const cacheService = new CacheService(cache);
  const userService = new UserService(cacheService);

  app.decorate('userService', userService);

  app.addHook('onRequest', async function bindUser(request) {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    request.user = null;
    if (scheme !== 'Bearer') return;

    request.user = await this.userService.getUserByToken(token);
  });
});
