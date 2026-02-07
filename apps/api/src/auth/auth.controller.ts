import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ParseEmailPipe } from '../common/pipes/parse-email.pipe';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserEntity })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 409 },
        path: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async register(@Body() body: RegisterDto): Promise<UserEntity> {
    return this.usersService.createUser(body);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        user: { $ref: '#/components/schemas/UserEntity' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        path: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async login(
    @Body('email', ParseEmailPipe) email: string,
    @Body() body: LoginDto,
  ): Promise<{ accessToken: string; user: UserEntity }> {
    const user = await this.authService.validateUser(email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = this.authService.signToken(user);
    return { accessToken, user };
  }
}
