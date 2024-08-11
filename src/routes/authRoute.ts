import { FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { FromSchema } from 'json-schema-to-ts';
import passport from 'passport';
import {
  userLocalLoginSchema,
  userLocalRegisterSchema,
} from '../schemas/usersSchema';

export default fastifyPlugin(async function (app) {
  app

    .route({
      method: 'POST',
      url: '/local/register',
      schema: {
        description: 'register using local strategy',
        tags: ['users', 'auth'],
        body: userLocalRegisterSchema,
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
      async handler(
        request: FastifyRequest<{
          Body: FromSchema<typeof userLocalRegisterSchema>;
        }>,
      ) {
        const { email, password } = request.body;
        const user = await this.userService.registerUser(email, password);
        const token = await this.userService.createUserToken(user);
        return {
          token,
        };
      },
    })

    .route({
      method: 'POST',
      url: '/local/login',
      schema: {
        description: 'login using credentials strategy',
        tags: ['users', 'auth'],
        body: userLocalLoginSchema,
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
      preHandler: passport.authenticate('local', {
        session: false,
      }),
      async handler(request) {
        const token = await this.userService.createUserToken(request.user!);
        return {
          token,
        };
      },
    });
});
