import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username wajib diisi' })
  username!: string;

  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password!: string;

  @IsEnum(['MOBILE', 'WEB'], {
    message: 'Tipe perangkat harus MOBILE atau WEB',
  })
  device_type!: string;
}
