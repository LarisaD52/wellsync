# WellSync — Silver Challenge

## Ce s-a implementat

### 1. JWT Tokens (Bearer tokens)
- Login returnează atât `sessionId` cât și `token` (JWT semnat cu `JWT_SECRET`)
- JWT payload conține: `userId`, `email`, `role`, `permissions`, `sessionId`
- Backend acceptă `Authorization: Bearer <token>` SAU `x-session-id` (backwards compatible)
- Endpoint refresh: `POST /api/auth/refresh` → returnează JWT nou cu sesiune activă
- Frontend stochează token-ul în cookie și îl trimite în `Authorization` header

### 2. Roluri cu permisiuni diferite

| Permisiune        | ADMIN | MANAGER | USER |
|-------------------|-------|---------|------|
| READ_RESOURCES    | ✅    | ✅      | ✅   |
| CREATE_RESOURCE   | ✅    | ✅      | ❌   |
| UPDATE_RESOURCE   | ✅    | ✅      | ❌   |
| DELETE_RESOURCE   | ✅    | ❌      | ❌   |
| APPROVE_RESOURCE  | ✅    | ✅      | ❌   |
| VIEW_DEPARTMENT   | ✅    | ✅      | ❌   |
| VIEW_STATS        | ✅    | ✅      | ✅   |
| MANAGE_USERS      | ✅    | ❌      | ❌   |
| VIEW_LOGS         | ✅    | ❌      | ❌   |
| VIEW_SUSPICIOUS   | ✅    | ❌      | ❌   |

### 3. Password Recovery

```
POST /api/auth/forgot-password  { email }
  → returnează token (demo) sau trimite email (dacă SMTP configurat)

POST /api/auth/reset-password   { token, newPassword }
  → schimbă parola, invalidează toate sesiunile active
```

### 4. 3-Way Authentication

- **Email + parolă** → clasic
- **Google OAuth** → `GET /api/auth/google` → redirect Google → callback → JWT
- **Token refresh** → `POST /api/auth/refresh` (reînnoire sesiune fără re-login)

### Conturi demo:
```
admin@wellsync.com   / admin123   → ADMIN
manager@wellsync.com / manager123 → MANAGER  
user@wellsync.com    / user123    → USER
```

## Setup Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → API & Services → Credentials
2. Crează **OAuth 2.0 Client ID** (Web application)
3. Authorized redirect URI: `https://YOUR_LAN_IP:3001/api/auth/google/callback`
4. Adaugă în `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   GOOGLE_REDIRECT_URI=https://192.168.x.x:3001/api/auth/google/callback
   ```

## Rulare migrare Silver

```bash
cd backend
npx prisma migrate dev --name silver_auth
npm run db:seed
npm test
```
