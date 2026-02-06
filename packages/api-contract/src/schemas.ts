import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
});

export const RegisterSchema = UserSchema.extend({
  password: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserResponseSchema = RegisterSchema.omit({ password: true });

export type User = z.infer<typeof UserSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
