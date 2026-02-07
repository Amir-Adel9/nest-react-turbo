import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ accessToken: string; user: UserEntity }> {
    const user = await this.usersService.createUser(registerDto);
    return { accessToken: this.signToken(user), user };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: UserEntity }> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return { accessToken: this.signToken(user), user };
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

  signToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
}
