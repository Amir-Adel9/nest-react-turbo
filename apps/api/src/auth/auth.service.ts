import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

const ACCESS_TOKEN_MAX_AGE_MS = 900_000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_MS = 604_800_000; // 7 days
const REFRESH_COOKIE_PATH = '/api/auth/refresh';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  getAccessToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  getRefreshToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async setCookies(res: Response, user: UserEntity): Promise<void> {
    const accessToken = this.getAccessToken(user);
    const refreshToken = this.getRefreshToken(user);
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
    };

    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      path: REFRESH_COOKIE_PATH,
    });
  }

  async register(registerDto: RegisterDto, res: Response): Promise<UserEntity> {
    const user = await this.usersService.createUser(registerDto);
    await this.setCookies(res, user);
    return user;
  }

  async login(dto: LoginDto, res: Response): Promise<UserEntity> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.setCookies(res, user);
    return user;
  }

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<UserEntity | null> {
    const user = await this.usersService.findUserByEmailWithPassword(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) return null;
    return this.usersService.toUserResponse(user);
  }

  async refreshTokens(
    userId: string,
    refreshTokenFromCookie: string,
    res: Response,
  ): Promise<UserEntity> {
    const user = await this.usersService.getUserIfRefreshTokenMatches(
      userId,
      refreshTokenFromCookie,
    );
    await this.setCookies(res, user);
    return user;
  }

  async logout(userId: string, res: Response): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
    const clearOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 0,
    };
    res.cookie('access_token', '', { ...clearOptions, path: '/' });
    res.cookie('refresh_token', '', {
      ...clearOptions,
      path: REFRESH_COOKIE_PATH,
    });
  }
}
