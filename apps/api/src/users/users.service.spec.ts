import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<
    Pick<
      Model<UserDocument>,
      'create' | 'findOne' | 'find' | 'findById' | 'findByIdAndUpdate'
    >
  >;

  const mockUserDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    email: 'user@example.com',
    name: 'Test User',
    password: 'hashed',
  };

  const mockUserEntity: UserEntity = {
    id: '507f1f77bcf86cd799439011',
    email: 'user@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const mockModel = {
      create: jest.fn(),
      findOne: jest.fn().mockReturnThis(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  describe('createUser', () => {
    it('hashes password and creates user', async () => {
      (userModel.create as jest.Mock).mockResolvedValue(mockUserDoc);
      const result = await service.createUser({
        email: 'user@example.com',
        name: 'Test User',
        password: 'Password1!',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 10);
      expect(userModel.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed',
      });
      expect(result).toMatchObject({
        email: mockUserEntity.email,
        name: mockUserEntity.name,
      });
      expect(result.id).toBeDefined();
    });

    it('throws ConflictException on duplicate email', async () => {
      (userModel.create as jest.Mock).mockRejectedValue({ code: 11000 });
      await expect(
        service.createUser({
          email: 'dup@example.com',
          name: 'User',
          password: 'Password1!',
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.createUser({
          email: 'dup@example.com',
          name: 'User',
          password: 'Password1!',
        }),
      ).rejects.toThrow('User with this email already exists');
    });

    it('rethrows non-duplicate errors', async () => {
      const err = new Error('DB error');
      (userModel.create as jest.Mock).mockRejectedValue(err);
      await expect(
        service.createUser({
          email: 'u@example.com',
          name: 'User',
          password: 'Password1!',
        }),
      ).rejects.toThrow(err);
    });
  });

  describe('findUserByEmail', () => {
    it('returns null when not found', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(null);
      const result = await service.findUserByEmail('nobody@example.com');
      expect(result).toBeNull();
    });

    it('returns user entity when found', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(mockUserDoc);
      const result = await service.findUserByEmail('user@example.com');
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
      expect(result).toMatchObject({
        email: mockUserEntity.email,
        name: mockUserEntity.name,
      });
    });
  });

  describe('findById', () => {
    it('returns null for invalid id', async () => {
      const result = await service.findById('invalid');
      expect(result).toBeNull();
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('returns null when not found', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(null);
      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });

    it('returns user when found', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(mockUserDoc);
      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result).toMatchObject({ email: mockUserEntity.email });
    });
  });

  describe('findAll', () => {
    it('returns list of users', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue([mockUserDoc]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ email: mockUserEntity.email });
    });
  });

  describe('updateRefreshToken', () => {
    it('throws BadRequestException for invalid id', async () => {
      await expect(
        service.updateRefreshToken('invalid', 'token'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateRefreshToken('invalid', 'token'),
      ).rejects.toThrow('Invalid user id');
    });

    it('throws NotFoundException when user not found', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateRefreshToken('507f1f77bcf86cd799439011', 'token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('hashes and updates when token provided', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(mockUserDoc);
      await service.updateRefreshToken(
        '507f1f77bcf86cd799439011',
        'refresh-token',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('refresh-token', 10);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $set: { refreshToken: 'hashed' } },
        { new: true },
      );
    });

    it('clears token when null', async () => {
      (userModel.exec as jest.Mock).mockResolvedValue(mockUserDoc);
      await service.updateRefreshToken('507f1f77bcf86cd799439011', null);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { $set: { refreshToken: null } },
        { new: true },
      );
    });
  });

  describe('getUserIfRefreshTokenMatches', () => {
    it('throws UnauthorizedException for invalid id', async () => {
      await expect(
        service.getUserIfRefreshTokenMatches('invalid', 'token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when user has no refreshToken', async () => {
      (userModel.select as jest.Mock).mockReturnThis();
      (userModel.exec as jest.Mock).mockResolvedValue(null);
      await expect(
        service.getUserIfRefreshTokenMatches(
          '507f1f77bcf86cd799439011',
          'token',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      (userModel.select as jest.Mock).mockReturnThis();
      (userModel.exec as jest.Mock).mockResolvedValue({
        ...mockUserDoc,
        refreshToken: 'stored-hash',
      });
      await expect(
        service.getUserIfRefreshTokenMatches(
          '507f1f77bcf86cd799439011',
          'wrong-token',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns user when token matches', async () => {
      (userModel.select as jest.Mock).mockReturnThis();
      (userModel.exec as jest.Mock).mockResolvedValue({
        ...mockUserDoc,
        refreshToken: 'stored-hash',
      });
      const result = await service.getUserIfRefreshTokenMatches(
        '507f1f77bcf86cd799439011',
        'correct-token',
      );
      expect(result).toMatchObject({ email: mockUserEntity.email });
    });
  });

  describe('toUserResponse', () => {
    it('strips password and exposes id, email, name', () => {
      const doc = {
        _id: mockUserDoc._id,
        email: mockUserDoc.email,
        name: mockUserDoc.name,
        password: 'secret',
        refreshToken: 'rt',
      };
      const result = service.toUserResponse(doc);
      expect(result.id).toBe(mockUserDoc._id.toString());
      expect(result.email).toBe(mockUserDoc.email);
      expect(result.name).toBe(mockUserDoc.name);
      expect((result as { password?: string }).password).toBeUndefined();
    });
  });
});
