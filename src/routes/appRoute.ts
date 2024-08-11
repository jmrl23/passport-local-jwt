import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function (app) {
  app.route({
    method: 'GET',
    url: '/',
    schema: { hide: true },
    handler(_, reply) {
      reply.redirect('/docs');
    },
  });
});
