# Authentication API - Setup Guide

## Project Structure (Clean Architecture)

```
src/
├── app.controller.ts          # Main app controller
├── app.module.ts              # Main app module
├── app.service.ts             # Main app service
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   └── exceptions/
│       └── exception-translator.ts    # Centralized error handling
├── shared/                    # Shared services
│   └── database/
│       └── database.service.ts        # Database connection service
└── modules/                   # Feature modules
    ├── auth/                  # Authentication module
    │   ├── auth.controller.ts        # Auth endpoints
    │   ├── auth.service.ts           # Auth business logic
    │   ├── auth.repository.ts        # Token repository
    │   ├── auth.module.ts            # Auth NestJS module
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── register.dto.ts
    │   │   └── token-response.dto.ts
    │   └── interfaces/
    │       └── token-payload.interface.ts
    └── users/                 # Users module
        ├── users.controller.ts
        ├── users.service.ts
        ├── users.repository.ts
        └── users.module.ts
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# PostgreSQL Configuration
PGHOST=localhost
PGPORT=5432
PGDATABASE=tes_disleksia
PGUSER=postgres
PGPASSWORD=your_password

# JWT Secrets (Change these to strong random values!)
ACCESS_TOKEN_KEY=your-secret-access-token-key-change-this
REFRESH_TOKEN_KEY=your-secret-refresh-token-key-change-this

# Token Expiration
ACCESS_TOKEN_AGE_MOBILE=1d
ACCESS_TOKEN_AGE_WEB=10m

# Server
PORT=3000
```

### 2. Database Setup

#### Option A: Using Migrations (Recommended)

```bash
# Create the migrations directory structure (already exists)
npm run migrate:up
```

#### Option B: Manual SQL

Connect to PostgreSQL and run:

```sql
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('ADMIN','GURU')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_tokens (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    device_type VARCHAR(10) CHECK (device_type IN ('MOBILE','WEB')) NOT NULL,
    expired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, device_type)
);
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

Development mode (with auto-reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Response Format (All Endpoints)

Setiap endpoint mengembalikan format response yang konsisten:

```json
{
  "responseStatus": true,
  "responseMessage": "Success message",
  "responseBody": {}
}
```

**Penjelasan:**
- `responseStatus`: `true` untuk sukses, `false` untuk gagal
- `responseMessage`: Pesan deskriptif (Success, Failed, atau pesan error spesifik)
- `responseBody`: Data response (null jika gagal)

### 1. Register User
**Endpoint:** `POST /auth/register`

Request:
```json
{
  "username": "samuel",
  "password": "password123",
  "fullname": "Samuel Prasetyo",
  "role": "ADMIN"
}
```

Success Response (201):
```json
{
  "responseStatus": true,
  "responseMessage": "Registration successful",
  "responseBody": {
    "user_id": "3",
    "username": "samuel",
    "fullname": "Samuel Prasetyo",
    "role": "ADMIN"
  }
}
```

Error Response (409 - Username exists):
```json
{
  "responseStatus": false,
  "responseMessage": "Username already registered",
  "responseBody": null
}
```

### 2. Login
**Endpoint:** `POST /auth/login`

Request:
```json
{
  "username": "samuel",
  "password": "password123",
  "device_type": "MOBILE"
}
```

Success Response (201):
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

Error Response (401 - Invalid credentials):
```json
{
  "responseStatus": false,
  "responseMessage": "Invalid credentials",
  "responseBody": null
}
```

### 3. Refresh Token
**Endpoint:** `POST /auth/refresh`

Request:
```json
{
  "user_id": 3,
  "device_type": "MOBILE",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Success Response (201):
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

Error Response (401 - Invalid token):
```json
{
  "responseStatus": false,
  "responseMessage": "Refresh token is invalid or expired",
  "responseBody": null
}
```

## Token Specifications

- **Access Token Expiry:**
  - MOBILE: 1 day (1d)
  - WEB: 10 minutes (10m)

- **Refresh Token Expiry:** 30 days

- **Token Type:** JWT (JSON Web Token)

- **Password Encryption:** bcrypt (with salt rounds = 10)

## Code Quality

All code follows TypeScript strict mode and ESLint rules:

```bash
# Run linter
npm run lint

# Build project
npm run build

# Format code
npm run format
```

## Architecture Principles

1. **Clean Architecture:** Separation of concerns (Controller → Service → Repository)
2. **Modular:** Each feature (auth, users) is a separate module
3. **Centralized Error Handling:** All database errors translated in one file
4. **Type Safety:** Full TypeScript strict mode enabled
5. **Repository Pattern:** Database operations isolated from business logic

## Notes

- **No nodemon needed:** NestJS includes automatic reload with `npm run start:dev`
- **ESLint configured:** Automatically checks code quality on lint
- **Migrations ready:** Use node-pg-migrate for database versioning
- **JWT Strategy:** Supports multiple device types with different token expiration times
