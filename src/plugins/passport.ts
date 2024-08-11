import fastifyPlugin from 'fastify-plugin';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

export default fastifyPlugin(async function passportStrategies(app) {
  passport.use(
    'local',
    new LocalStrategy({ usernameField: 'email' }, async function verify(
      email,
      password,
      done,
    ) {
      try {
        const user = await app.userService.loginUser(email, password);
        done(null, user);
      } catch (error) {
        done(error);
      }
    }),
  );
});
