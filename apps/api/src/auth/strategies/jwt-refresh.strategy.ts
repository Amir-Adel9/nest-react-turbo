import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { Env } from '../../common/config/env.validation';

export type JwtRefreshPayload = { sub: string; email: string; name: string };

function refreshCookieExtractor(req: Request | null): string | null {
  return req?.cookies?.refresh_token ?? null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<Env, true>) {
    super({
      jwtFromRequest: refreshCookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET', {
        infer: true,
      }),
      algorithms: ['HS256'],
      passReqToCallback: false,
    });
  }

  validate(payload: JwtRefreshPayload): { sub: string } {
    return { sub: payload.sub };
  }
}
