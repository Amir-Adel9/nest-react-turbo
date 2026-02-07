import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserEntity {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString?.() ?? obj._id)
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;

  @Exclude()
  password?: string;
}
