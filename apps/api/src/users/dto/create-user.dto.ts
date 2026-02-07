import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Password1!',
    minLength: 8,
    description:
      'Min 8 characters, at least one letter, one number, one special character',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
