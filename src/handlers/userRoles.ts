import { UserRole } from '@prisma/client';
import { FastifyRequest } from 'fastify';
import { Forbidden, Unauthorized } from 'http-errors';

type Roles = UserRole | 'ALL';

export default function userRoles(...roles: Roles[]) {
  return async function (request: FastifyRequest) {
    if (!request.user) throw Unauthorized('no session');
    if (roles.includes('ALL')) return;
    if (!roles.includes(request.user.UserRole)) {
      throw new Forbidden('user is forbidden from accessing this resource');
    }
  };
}
