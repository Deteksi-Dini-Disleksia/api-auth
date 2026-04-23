# API Auth — Dokumentasi Endpoint

Base URL: `https://api-auth-development.up.railway.app`

> Semua response dibungkus dalam format:
>
> ```json
> {
>   "responseStatus": true,
>   "responseMessage": "...",
>   "responseBody": { ... }
> }
> ```

---

# 1. Register: POST /auth/register

Mendaftarkan akun baru. Sistem akan mengirimkan email verifikasi ke alamat email yang didaftarkan. Akun baru akan aktif setelah email diverifikasi.

## Request Body

```json
{
  "username": "user@example.com",
  "password": "password123",
  "fullname": "Nama Lengkap"
}
```

| Field      | Tipe   | Keterangan                                  |
| ---------- | ------ | ------------------------------------------- |
| `username` | string | Harus berupa email valid, maks 100 karakter |
| `password` | string | Min 6, maks 255 karakter                    |
| `fullname` | string | Maks 255 karakter                           |

## Response Success

```json
{
  "responseStatus": true,
  "responseMessage": "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
  "responseBody": {
    "message": "Registrasi berhasil! Silakan cek email Anda untuk verifikasi."
  }
}
```

## Response Error — Email sudah terdaftar (400)

```json
{
  "responseStatus": false,
  "responseMessage": "Email sudah terdaftar",
  "responseBody": null
}
```

---

# 2. Verify Email: GET /auth/verify-email

Memverifikasi email melalui token yang dikirim ke email. Endpoint ini akan **redirect** ke halaman login frontend.

## Query Parameter

| Parameter | Keterangan                          |
| --------- | ----------------------------------- |
| `token`   | Token verifikasi dari link di email |

## Redirect Success

```
{frontend_url}/login?verified=true
```

## Redirect Gagal

```
{frontend_url}/login?verified=false
```

---

# 3. Login: POST /auth/login

Login dan mendapatkan access token & refresh token.

## Request Body

```json
{
  "username": "user@example.com",
  "password": "password123",
  "device_type": "WEB"
}
```

| Field         | Tipe   | Keterangan                    |
| ------------- | ------ | ----------------------------- |
| `username`    | string | Email yang sudah diverifikasi |
| `password`    | string | Password akun                 |
| `device_type` | string | `WEB` atau `MOBILE`           |

## Response Success

```json
{
  "responseStatus": true,
  "responseMessage": "Login successful",
  "responseBody": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "token_type": "Bearer"
  }
}
```

| Field           | Keterangan                                            |
| --------------- | ----------------------------------------------------- |
| `access_token`  | JWT untuk mengakses API, berlaku 1 hari               |
| `refresh_token` | Token untuk memperbarui access token, berlaku 30 hari |
| `expiresIn`     | Masa berlaku access token dalam detik                 |

## Response Error — Kredensial salah (401)

```json
{
  "responseStatus": false,
  "responseMessage": "Login gagal! Periksa email dan password Anda",
  "responseBody": null
}
```

---

# 4. Refresh Token: POST /auth/refresh

Memperbarui access token menggunakan refresh token yang masih valid.

## Request Body

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Response Success

```json
{
  "responseStatus": true,
  "responseMessage": "Token refreshed successfully",
  "responseBody": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "token_type": "Bearer"
  }
}
```

## Response Error — Token tidak valid (401)

```json
{
  "responseStatus": false,
  "responseMessage": "Invalid refresh token",
  "responseBody": null
}
```
