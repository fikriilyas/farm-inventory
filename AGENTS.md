# Farm Inventory - Agent Guide

## Dev Commands

```bash
# Run both client + server (concurrently)
npm run dev

# Server only (port 3001)
npm run server

# Client only (port 5173 with API proxy)
npm run client

# Install all deps
npm run install:all

# Tests
cd server && npm test          # Jest (supertest)
cd client && npm test           # Vitest (jsdom)
```

## Architecture

- **Monorepo**: `client/` (React/Vite) + `server/` (Express/SQLite)
- **Server entry**: `server/index.js` - creates Express app, runs migrations/seeds on startup
- **Real entry used**: `server/server.js` - calls `migrate()`, `seed()`, then `createApp()`
- **Database**: SQLite at `server/db/inventory.db` (docker volume: `./server/db:/app/db`)
- **API port**: 3001 (server), proxied from client dev server at `/api`
- **Client dev**: port 5173, Vite proxy forwards `/api` → `http://localhost:3001`

## Database

- Auto-migrates on startup: `price` column → `purchase_price` + `selling_price`
- Seeds default data (categories, items, users) on first run when tables are empty
- **Default users**: `owner` / `owner123`, `officer1-3` / `officer123`

## Testing

- **Server**: Jest with supertest, requires `NODE_ENV=test` (set via cross-env)
- **Client**: Vitest with jsdom, setup file at `src/test/setup.js`
- No test config files - both use framework defaults

## Docker / CI

- `docker-compose.yml` builds client (port 3000) + server (port 3001) on bridge network
- CI (`.github/workflows/docker.yml`) builds and pushes to Docker Hub on `master` push
- Two separate images: `farm-inventory-server` and `farm-inventory-client`

## Quirks

- Server uses CommonJS (`require`), client uses ESM (`import`)
- Session secret hardcoded: `farm-inventory-secret-key-2024` (not for production)
- `server/src/index.js` exports `createApp` but actual entry `server.js` bypasses it for DB init order
