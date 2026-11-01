import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(12) password!: string;
  @IsIn(['ADMIN', 'STAFF']) role!: 'ADMIN' | 'STAFF';
}
