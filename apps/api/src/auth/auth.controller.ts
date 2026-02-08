import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a user and logs them in. Sets access_token and refresh_token via Set-Cookie (httpOnly).',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful; user is logged in',
    type: UserEntity,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 409 },
        message: {
          type: 'string',
          example: 'User with this email already exists',
        },
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    return this.authService.register(registerDto, res);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Authenticates and sets access_token and refresh_token via Set-Cookie (httpOnly).',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string' },
      },
    },
  })
  async login(
    @Body() loginDTO: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    return this.authService.login(loginDTO, res);
  }

  @Post('auth/refresh')
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Uses the refresh_token cookie to issue a new access_token and refresh_token (rotation). Requires the refresh_token cookie (sent only to this path).',
  })
  @ApiResponse({
    status: 200,
    description: 'New token pair set via Set-Cookie; returns current user',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing refresh token',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string' },
      },
    },
  })
  @ApiCookieAuth('refresh_token')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Request()
    req: { user: { sub: string }; cookies?: { refresh_token?: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserEntity> {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refreshTokens(req.user.sub, refreshToken, res);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout',
    description:
      'Clears the stored refresh token and both cookies. Requires access_token cookie.',
  })
  @ApiResponse({ status: 204, description: 'Logged out' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing access token',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string' },
      },
    },
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req: { user: UserEntity },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.id, res);
  }

  @Get('auth/me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Current user (requires access_token cookie)',
    type: UserEntity,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing access token',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string' },
      },
    },
  })
  getMe(@Request() req: { user: UserEntity }): UserEntity {
    return req.user;
  }
}
