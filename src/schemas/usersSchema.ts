import { UserRole } from '@prisma/client';

export const userLocalLoginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      examples: ['user1@example.com'],
    },
    password: {
      type: 'string',
      examples: ['password1'],
    },
  },
} as const;

export const userLocalRegisterSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      examples: ['user1@example.com'],
    },
    password: {
      type: 'string',
      minLength: 6,
      examples: ['password1'],
    },
  },
} as const;

export const userSchema = {
  type: 'object',
  required: ['id', 'email'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    UserRole: {
      type: 'string',
      enum: Object.keys(UserRole).filter((key) => typeof key === 'string'),
    },
    UserInformation: {
      type: 'object',
      nullable: true,
      properties: {
        displayName: {
          type: 'string',
          examples: ['john doe'],
        },
        gender: {
          type: 'string',
          examples: ['male'],
        },
      },
    },
  },
} as const;
