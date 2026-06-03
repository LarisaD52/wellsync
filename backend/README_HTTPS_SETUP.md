# WellSync — HTTPS & LAN Setup (Bronze Challenge)

## 1. Generează certificatul self-signed

```bash
cd backend
bash gen-certs.sh <IP_SERVER_PE_LAN>
# Exemplu: bash gen-certs.sh 192.168.1.100
```

Aceasta creează `backend/certs/server.key` și `backend/certs/server.crt`.

## 2. Configurează frontend-ul cu IP-ul serverului

Creează fișierul `.env` în rădăcina proiectului (lângă `vite.config.js`):

```env
VITE_API_BASE=https://192.168.1.100:3001/api
```

> **Înlocuiește `192.168.1.100` cu IP-ul real al mașinii serverului pe LAN.**

## 3. Pornește serverul

```bash
cd backend
npm install
npm run db:migrate   # dacă nu ai rulat deja
npm run db:seed      # dacă nu ai rulat deja
npm start
```

Ar trebui să vezi:
```
🔒 HTTPS enabled (self-signed certificate)
✅ WellSync API running on https://0.0.0.0:3001
```

## 4. Pornește frontend-ul (pe mașina client)

```bash
# În rădăcina proiectului (pe mașina client)
npm install
npm run dev -- --host
```

Accesează `http://IP_CLIENT:5173` din browser.

> **La prima accesare HTTPS**, browserul va afișa avertisment de certificat self-signed.  
> Apasă **"Advanced" → "Proceed anyway"** (acceptă excepția).

## 5. Rulează testele

### Backend (Jest + Supertest):
```bash
cd backend
npm test
```

### Frontend (Vitest):
```bash
# În rădăcina proiectului
npm run test
```

## Funcționalități implementate

| Feature | Status |
|---------|--------|
| Login cu email + parolă | ✅ |
| Register cu validare | ✅ |
| Sesiuni cu `x-session-id` | ✅ |
| **Inactivity timeout (15 min)** | ✅ |
| **HTTPS cu certificat self-signed** | ✅ |
| Role-based access (ADMIN / USER) | ✅ |
| **API_BASE configurabil via .env** | ✅ |
| Teste backend (login/register/logout) | ✅ |
| Teste frontend (validare form) | ✅ |
| Server pe LAN (0.0.0.0) | ✅ |
