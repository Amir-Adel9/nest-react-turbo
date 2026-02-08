import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Pick<UsersService, 'createUser' | 'findUserByEmailWithPassword' | 'toUserResponse' | 'updateRefreshToken' | 'getUserIfRefreshTokenMatches'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let res: jest.Mocked<Pick<Response, 'cookie'>>;

  const mockUser: UserEntity = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      findUserByEmailWithPassword: jest.fn(),
      toUserResponse: jest.fn(),
      updateRefreshToken: jest.fn(),
      getUserIfRefreshTokenMatches: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };
    res = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('validateUser', () => {
    it('returns null when user not found', async () => {
      usersService.findUserByEmailWithPassword.mockResolvedValue(null);
      const result = await service.validateUser('nobody@example.com', 'pass');
      expect(result).toBeNull();
    });

    it('returns null when password does not match', async () => {
      usersService.findUserByEmailWithPassword.mockResolvedValue({
        _id: mockUser.id as unknown as import('mongoose').Types.ObjectId,
        email: mockUser.email,
        name: mockUser.name,
        password: 'hashed',
      } as never);
      usersService.toUserResponse.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('returns user when password matches', async () => {
      usersService.findUserByEmailWithPassword.mockResolvedValue({
        _id: mockUser.id as unknown as import('mongoose').Types.ObjectId,
        email: mockUser.email,
        name: mockUser.name,
        password: 'hashed',
      } as never);
      usersService.toUserResponse.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser('test@example.com', 'correct');
      expect(result).toEqual(mockUser);
    });
  });

  describe('register', () => {
    it('creates user and sets cookies', async () => {
      usersService.createUser.mockResolvedValue(mockUser);
      const result = await service.register(
        { email: mockUser.email, name: mockUser.name, password: 'Password1!' },
        res as Response,
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
        password: 'Password1!',
      });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, 'signed-token');
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'signed-token', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'signed-token', expect.any(Object));
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('throws when user invalid', async () => {
      usersService.findUserByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.login(
          { email: 'nobody@example.com', password: 'pass' },
          res as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it('sets cookies and returns user when valid', async () => {
      usersService.findUserByEmailWithPassword.mockResolvedValue({
        _id: mockUser.id as unknown as import('mongoose').Types.ObjectId,
        email: mockUser.email,
        name: mockUser.name,
        password: 'hashed',
      } as never);
      usersService.toUserResponse.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login(
        { email: mockUser.email, password: 'correct' },
        res as Response,
      );
      expect(usersService.updateRefreshToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'signed-token', expect.any(Object));
      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshTokens', () => {
    it('gets user and sets cookies', async () => {
      usersService.getUserIfRefreshTokenMatches.mockResolvedValue(mockUser);
      const result = await service.refreshTokens(
        mockUser.id,
        'refresh-token',
        res as Response,
      );
      expect(usersService.getUserIfRefreshTokenMatches).toHaveBeenCalledWith(
        mockUser.id,
        'refresh-token',
      );
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, 'signed-token');
      expect(res.cookie).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('clears refresh token and cookies', async () => {
      await service.logout(mockUser.id, res as Response);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, null);
      expect(res.cookie).toHaveBeenCalledWith('access_token', '', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', '', expect.any(Object));
    });
  });

  describe('getAccessToken', () => {
    it('returns signed token with user payload', () => {
      const token = service.getAccessToken(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, name: mockUser.name },
        { expiresIn: '15m' },
      );
      expect(token).toBe('signed-token');
    });
  });

  describe('getRefreshToken', () => {
    it('returns signed token with user payload', () => {
      const token = service.getRefreshToken(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, name: mockUser.name },
        { expiresIn: '7d' },
      );
      expect(token).toBe('signed-token');
    });
  });
});
