import fastifyPlugin from 'fastify-plugin';
import { Unauthorized } from 'http-errors';
import userRoles from '../handlers/userRoles';
import { userSchema } from '../schemas/usersSchema';

export default fastifyPlugin(async function (app) {
  app

    .route({
      method: 'GET',
      url: '/session',
      schema: {
        description: 'get session',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            required: ['user'],
            properties: {
              user: userSchema,
            },
          },
        },
      },
      preHandler: [userRoles('ALL')],
      async handler(request) {
        return {
          user: request.user,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/logout',
      schema: {
        description: 'logout user',
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            required: ['token'],
            properties: {
              token: {
                type: 'string',
              },
            },
          },
        },
      },
      preHandler: [userRoles('ALL')],
      async handler(request) {
        const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
        if (scheme !== 'Bearer') throw new Unauthorized();
        await this.userService.logoutUser(token);
        return {
          token,
        };
      },
    });
});
