import dotenv from 'dotenv';
import fastify from 'fastify';
import passport from './plugins/passport';
import swagger from './plugins/swagger';
import users from './plugins/users';
import appRoute from './routes/appRoute';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';

dotenv.config();

async function main() {
  const app = fastify();

  await Promise.all([
    app.register(swagger),
    app.register(passport),
    app.register(users),
  ]);
  await app.register(appRoute);
  await app.register(userRoute, { prefix: '/user' });
  await app.register(authRoute, { prefix: '/auth' });

  const port = parseInt(process.env.PORT ?? '3001');

  app.listen({ host: '0.0.0.0', port }, () => {
    console.log('listening on port', port);
  });
}
void main();
