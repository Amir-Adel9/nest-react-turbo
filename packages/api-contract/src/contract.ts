import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { RegisterSchema, LoginSchema, UserResponseSchema } from './schemas';

const c = initContract();

export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/auth/register',
    body: RegisterSchema,
    responses: { 201: UserResponseSchema },
    summary: 'Register a new user',
  },
  login: {
    method: 'POST',
    path: '/auth/login',
    body: LoginSchema,
    responses: {
      200: z.object({ accessToken: z.string(), user: UserResponseSchema }),
    },
    summary: 'Login',
  },
});
