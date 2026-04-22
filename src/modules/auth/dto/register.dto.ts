import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Username harus berupa email yang valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  @MaxLength(100, { message: 'Email maksimal 100 karakter' })
  username!: string;

  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(255, { message: 'Password maksimal 255 karakter' })
  password!: string;

  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @MaxLength(255, { message: 'Nama lengkap maksimal 255 karakter' })
  fullname!: string;
}
