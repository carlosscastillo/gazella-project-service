# gazella-project-service

Gazella's project and volunteer management service.

## Overview

REST API service (Node.js + TypeScript + Express) that handles project creation, management, and volunteer enrollment. Communicates with `gazella-project-data-service` via gRPC for all data persistence.

## Tech Stack

- **Runtime:** Node.js 24
- **Language:** TypeScript
- **Framework:** Express 5
- **Inter-service:** gRPC (`@grpc/grpc-js`)
- **Validation:** Zod
- **Auth:** JWT via `express-jwt` + JWKS (IDP)
- **Docs:** Swagger / OpenAPI 3.0
- **Container:** Docker

## Port

`7100` (development)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
PORT=7100
NODE_ENV=development
ISSUER_URL=http://localhost:4000/oidc
DATA_SERVICE_URL=localhost:8200
```

## Getting Started

```bash
npm install
npm run dev
```

## Docker

```bash
docker compose up --build
```

## API Documentation

Available at `http://localhost:7100/docs` when running in development mode.
