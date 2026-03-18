export class TokenResponseDto {
  access_token: string;
  refresh_token: string;
  expiresIn: number;
  token_type = 'Bearer';

  constructor(access_token: string, refresh_token: string, expiresIn: number) {
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.expiresIn = expiresIn;
  }
}
