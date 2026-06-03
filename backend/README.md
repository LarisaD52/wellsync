# WellSync Backend — Assignment 3 (Bronze + Silver + Gold)

PostgreSQL + Prisma + Express.js + Socket.io

---

## Setup complet

### 1. Pornește PostgreSQL în Docker
```bash
docker-compose up -d
```

### 2. Instalează dependențele
```bash
npm install
```

### 3. Migrare DB (creează tabelele automat din schema Prisma)
```bash
npx prisma migrate dev --name init
```

### 4. Seed (populează DB cu date inițiale)
```bash
npm run db:seed
```

### 5. Pornește serverul
```bash
npm run dev
```
Serverul rulează la `http://0.0.0.0:3001` (accesibil din altă mașină!)

---

## Credențiale test
- **Admin:** admin@wellsync.com / admin123
- **User:**  user@wellsync.com  / user123

---

## Endpoint-uri

### Auth
| Method | URL | Descriere |
|--------|-----|-----------|
| POST | `/api/auth/login` | Login → returnează sessionId |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/register` | Înregistrare user nou |
| GET | `/api/auth/me` | Info sesiune curentă |

> Trimite `x-session-id: <sessionId>` în header la toate cererile autentificate

### Resources (necesită autentificare)
| Method | URL | Permisiune necesară |
|--------|-----|---------------------|
| GET | `/api/resources` | READ_RESOURCES |
| GET | `/api/resources/stats` | VIEW_STATS |
| GET | `/api/resources/:id` | READ_RESOURCES |
| POST | `/api/resources` | CREATE_RESOURCE (ADMIN) |
| PUT | `/api/resources/:id` | UPDATE_RESOURCE (ADMIN) |
| DELETE | `/api/resources/:id` | DELETE_RESOURCE (ADMIN) |

#### Parametri GET /api/resources
- `page`, `pageSize` — paginare server-side
- `department` — filtru: IT, Sales, HR, Management, Toate
- `type` — filtru: Video, Quiz, Course, Event
- `search` — caută în name și unlockCondition
- `sortBy` — name, rating, views, dateAdded
- `order` — asc, desc

### Logs — GOLD (doar ADMIN)
| Method | URL | Descriere |
|--------|-----|-----------|
| GET | `/api/logs` | Toate acțiunile loggate |
| GET | `/api/logs/suspicious` | Useri suspicioși |
| PUT | `/api/logs/suspicious/:userId/resolve` | Rezolvă caz suspicios |

---

## Silver: Real-time Chat (Socket.io)
```javascript
import { io } from "socket.io-client";

const socket = io("http://SERVER_IP:3001", {
  auth: { sessionId: "your-session-id" }
});

socket.emit("chat:send", "Hello everyone!");
socket.on("chat:message", (msg) => console.log(msg));
socket.on("chat:history", (history) => console.log(history));
```

---

## Gold: Logging automat
Fiecare acțiune (login, CRUD, etc.) este logată automat în tabela `action_logs`.

**Detectare comportament suspicios:**
- 5+ delete-uri în 1 minut → flagged
- 20+ create-uri în 1 minut → flagged
- 5+ login-uri eșuate în 5 minute → flagged

Userii suspicioși apar în `/api/logs/suspicious` și pot fi văzuți de ADMIN.

---

## Rulează testele
```bash
npm test
```

---

## Schema DB — 3NF
```
departments (id, name)
resource_types (id, name)
resources (id, name, unlockCondition, rating, views, dateAdded, departmentId FK, typeId FK)
roles (id, name, description)
permissions (id, name, description)
role_permissions (roleId FK, permissionId FK) — many-to-many
users (id, email, fullName, passwordHash, roleId FK, departmentId FK, isActive)
action_logs (id, userId FK, groupId, action, actionInfo, ipAddress, isSuspicious, timestamp)
suspicious_users (id, userId, email, reason, flaggedAt, resolvedAt, isResolved)
```

---

## Conectare DBeaver
- Host: `localhost` (sau IP-ul serverului)
- Port: `5432`
- Database: `wellsync`
- User: `wellsync`
- Password: `wellsync123`

---

## Client pe altă mașină (cerința Bronze)
Schimbă în frontend `useApi.js`:
```javascript
const API_BASE = "http://IP_SERVER:3001/api";
```
