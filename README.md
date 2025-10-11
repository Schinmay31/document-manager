# Document Manager API

Lightweight document-management API built with Node.js + TypeScript, Express and MongoDB. It includes
- RBAC (role-based access control)
- Per-route input validation (express-validator)
- Audit logging for important events
- File uploads (local filesystem)
- Webhook handling (OCR example)
- Rate limiting and basic metrics

## Quick links
- Project root: `src/`
- Environment example: `.env.example`
- Docker: `docker-compose.yml`, `Dockerfile`
-  Scripts: see package.json (dev, build, start, test, lint, seed, docker:*)

## Setup & run

Prereqs: Node 18+, npm, Docker (optional), MongoDB (local or Atlas).

1. Clone and install

```bash
git clone <repo-url>
cd document-manager
npm ci
cp .env.example .env
# Edit .env to set JWT_SECRET, MONGO_URI, etc.
```

2. Run in development

```bash
npm run dev
# server will listen on PORT (default 3000) and use .env values
```

3. Run tests

```bash
npm test
```

4. Lint & format

```bash
npm run lint
npm run lint:fix
```

5. Using Docker 

Build and start with Docker Compose:

```powershell
docker-compose build
docker-compose up -d
docker-compose logs -f api
docker-compose down
```

## Environment

Copy `.env.example` ➜ `.env` and set secrets. Important keys:
- `PORT` — server port
- `MONGO_URI` — mongodb connection
- `JWT_SECRET` — secret for signing tokens
- `UPLOAD_DIR` — path for storing uploaded files
- rate limiter: `REQUEST_LIMIT`, `WINDOW_MS`, `COOLDOWN_MS`

## API Reference (examples)

Authentication

1) Login (returns JWT)

```bash
curl -s -X POST http://localhost:3000/v1/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"user@example.com"}'
```

Use the returned token in Authorization header for protected endpoints:

`Authorization: Bearer <token>`


Documents

- Upload document (multipart/form-data). `primaryTag` and `secondaryTags` accepted. When using Postman or curl you can send `secondaryTags` as a JSON string (e.g. `'["a","b"]'`).

```bash
curl -X POST http://localhost:3000/v1/docs \
	-H "Authorization: Bearer $TOKEN" \
	-F "file=@/path/to/file.pdf" \
	-F "primaryTag=609c..." \
	-F "secondaryTags=[\"tag1\",\"tag2\"]"
```

- Search documents

```bash
curl "http://localhost:3000/v1/docs/search?q=invoice&scope=folder" \
	-H "Authorization: Bearer $TOKEN"
```

- List folders (primary tags with counts)

```bash
curl http://localhost:3000/v1/docs/folders -H "Authorization: Bearer $TOKEN"
```

Metrics

- Get metrics (requires appropriate permission)

```bash
curl http://localhost:3000/v1/metrics/metrics -H "Authorization: Bearer $TOKEN"
```

Notes
- All protected endpoints require `Authorization` header; RBAC is enforced via a middleware that checks role permissions and, where applicable, resource ownership.

## Design decisions & tradeoffs

- Architecture
	- Express + Controller/Service layer for separation of concerns.
	- Mongoose for MongoDB data modeling.

- RBAC
	- Central `PERMISSIONS` and `ROLE_PERMISSIONS` map with a `requirePermission` middleware.
	- Ownership (`:own`) is enforced by checking `res.locals.userData` against resource `ownerId` in services — simple and explicit.

- Validation
	- `express-validator` for per-route input checks; central `validateRequest` middleware returns tidy 400 errors.

- Auditing & Metrics
	- Audit logs written to `AuditLog` collection on key events (create/update/delete, OCR triggers), enabling simple metrics queries.

- Docker
	- Multi-stage Dockerfile to build TypeScript in a builder stage and produce a smaller runtime image.

- Tradeoffs
	- File uploads are stored on local disk (simple, low-cost). For multiple replicas or cloud deployments, object storage (S3) is preferred.
	- RBAC is role + permission based but does not include a dedicated models(data is coming from constants). (ownership checks occur in services). This is simpler and safer but duplicates checks in services.
	- No background queue yet for heavy OCR or indexing tasks — currently performed synchronously or via webhooks.

## What I'd do next with more time

1. Move uploads to object storage (S3) + signed URLs and remove local disk dependency.
2. Add an owner-resolver middleware to centralize `:own` checks and short-circuit requests earlier.
3. dedicated models like permission, role, user-roles to handle RBAC more dynamically.
4. Add background workers (Bull/Redis) for OCR, indexing and large file processing.
5. Add end-to-end tests and a small CI pipeline (GitHub Actions) that runs lint, tests and builds the Docker image.
6. Add rate-limit per-user and per-route fine-tuning, and implement caching for metrics endpoints.
7. Add pagination to all get routes

## Timeline

- Start date: 2025-10-05
- Finish date: 2025-10-11

## Useful commands

```bash
# dev
npm run dev

# build & start
npm run build
npm start

# docker (build & run)
docker-compose build
docker-compose up -d

# tests
npm test

# lint
npm run lint
npm run lint:fix
```
