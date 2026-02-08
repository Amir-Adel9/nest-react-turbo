import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      SALT_ROUNDS,
    );
    try {
      const userDoc = await this.userModel.create({
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
      });
      return this.toUserResponse(userDoc);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw err;
    }
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const userDoc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .lean()
      .exec();

    if (!userDoc) return null;

    return this.toUserResponse(userDoc);
  }

  async findUserByEmailWithPassword(
    email: string,
  ): Promise<(User & { _id: Types.ObjectId; password: string }) | null> {
    const userDoc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean()
      .exec();
    if (!userDoc) return null;

    return userDoc as User & { _id: Types.ObjectId; password: string };
  }

  async findAll(): Promise<UserEntity[]> {
    const docs = await this.userModel.find().lean().exec();
    return docs.map((doc) => this.toUserResponse(doc));
  }

  async findById(id: string): Promise<UserEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const userDoc = await this.userModel.findById(id).lean().exec();
    if (!userDoc) return null;
    return this.toUserResponse(userDoc);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }
    const update: { refreshToken?: string | null } = refreshToken
      ? { refreshToken: await bcrypt.hash(refreshToken, SALT_ROUNDS) }
      : { refreshToken: null };
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('User not found');
    }
  }

  async getUserIfRefreshTokenMatches(
    userId: string,
    refreshToken: string,
  ): Promise<UserEntity> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userDoc = await this.userModel
      .findById(userId)
      .select('+refreshToken')
      .lean()
      .exec();
    if (!userDoc?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const isMatch = await bcrypt.compare(refreshToken, userDoc.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.toUserResponse(userDoc);
  }

  public toUserResponse(
    doc:
      | UserDocument
      | (Record<string, any> & User & { _id: Types.ObjectId })
      | Record<string, unknown>,
  ): UserEntity {
    const plain = (doc as UserDocument).toObject?.() ?? doc;

    return plainToInstance(UserEntity, plain, {
      excludeExtraneousValues: true,
    });
  }
}
