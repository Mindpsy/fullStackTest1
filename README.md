# CRM System

Full-stack CRM with Vue 2, Node.js, MongoDB, Redis: JWT auth, roles (admin/manager), caching, task reminders queue, WebSocket notifications, CSV export, Kanban board.

## Stack

- **Frontend**: Vue 2, Vuex, Vue Router, Vuetify 2, Axios, Socket.io-client, vuedraggable, XLSX
- **Backend**: Node.js, Express, Mongoose, Redis (ioredis), Bull, Socket.io, JWT, bcrypt, express-validator, multer
- **DB**: MongoDB
- **Infra**: Docker, docker-compose

## Quick start (Docker)

```bash
# From project root
cp .env.example .env
# Edit .env and set JWT_SECRET

docker-compose up -d mongodb redis
# Wait a few seconds, then create admin and run backend locally for dev, or:

docker-compose up -d
# Then create admin inside backend container:
docker-compose exec backend node scripts/seed.js
```

- App: http://localhost (frontend) or http://localhost:8080 (if running client in dev)
- API: http://localhost:3000/api

Default admin (after seed): `admin@crm.local` / `admin123`

## Development

### Backend

```bash
cd server
cp .env.example .env
npm install
# Ensure MongoDB and Redis are running (local or docker)
npm run dev
```

Create admin user:

```bash
npm run seed
```

### Frontend

```bash
cd client
npm install
npm run serve
```

Proxy in `vue.config.js` forwards `/api`, `/socket.io`, `/uploads` to the backend (default `http://localhost:3000`).

### Env

- `server/.env`: copy from `server/.env.example`. Set `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL` (e.g. `http://localhost:8080` for dev).

## Scripts

- **Backend**: `npm run dev` (nodemon), `npm start`, `npm run seed`, `npm test`
- **Frontend**: `npm run serve`, `npm run build`, `npm run lint`

## API

- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `POST /api/auth/register` — register (role: manager)
- `GET /api/auth/me` — current user (Bearer)
- `PUT /api/auth/profile` — update profile
- `POST /api/auth/avatar` — upload avatar (multipart)
- `POST /api/auth/logout` — invalidate token
- `GET/POST/PUT/DELETE /api/clients`, `GET /api/clients/export`
- `GET/POST/PUT/PATCH/DELETE /api/tasks`, `PATCH /api/tasks/:id/status`, `GET /api/tasks/export`
- `GET /api/dashboard/stats`, `GET /api/dashboard/recent-activities`
- `GET/POST/PUT/DELETE /api/users` (admin only)

## Roles

- **Admin**: full access; can delete clients/tasks; manages users.
- **Manager**: sees only own clients (managerId = self) and their tasks; can create/edit, no delete.

## Tests

```bash
cd server
npm test
```

Jest runs unit tests for services (e.g. auth, clients).

## License

MIT
