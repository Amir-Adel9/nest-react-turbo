import type { components, paths } from './schema';

export type { components, paths };

/** User entity from API (auth/me, login, register, refresh responses) */
export type UserEntity = components['schemas']['UserEntity'];

export type LoginDto = components['schemas']['LoginDto'];
export type RegisterDto = components['schemas']['RegisterDto'];

/** GET /api/auth/me response */
export type AuthMeResponse =
  paths['/api/auth/me']['get']['responses']['200']['content']['application/json'];

/** POST /api/auth/login response */
export type LoginResponse =
  paths['/api/auth/login']['post']['responses']['200']['content']['application/json'];

/** POST /api/auth/register response */
export type RegisterResponse =
  paths['/api/auth/register']['post']['responses']['201']['content']['application/json'];

/** POST /api/auth/refresh response */
export type RefreshResponse =
  paths['/api/auth/refresh']['post']['responses']['200']['content']['application/json'];

/** Backend error shape from GlobalExceptionFilter */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
}
