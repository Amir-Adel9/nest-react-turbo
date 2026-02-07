import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { Env } from '../../common/config/env.validation';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

export type JwtPayload = { sub: string; email: string; name: string };

function cookieExtractor(req: Request | null): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET', {
        infer: true,
      }),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
