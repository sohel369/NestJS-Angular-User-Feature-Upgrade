# Enterprise User Feature Upgrade Platform

A production-grade, enterprise Full-Stack solution built with **NestJS**, **Angular**, **PostgreSQL**, and **AWS (ECS, RDS, S3, CodePipeline)**.

---

## 🌟 Key Features Delivered

1. **User Profile Management:**
   - Create, retrieve, and update comprehensive user profiles (bio, contact details, social links, preferences).
   - Multi-format Avatar upload (JPEG, PNG, WEBP) with automatic file processing and local/S3 cloud storage.
   - Fast, accessible, reactive Angular components with instant avatar preview.

2. **Interactive Real-Time Analytics Dashboard:**
   - PostgreSQL aggregated metrics (`COUNT`, `SUM`, `GROUP BY`) for users, transactions, and system health.
   - **WebSocket Real-Time Gateway** (`@WebSocketGateway()`) streaming live event updates to Angular without page refreshes.
   - Interactive trend graphs and event distribution breakdown.
   - Interactive simulation trigger to test live real-time broadcasting on demand.

3. **DevOps, CI/CD & Cloud Architecture (AWS):**
   - **Infrastructure as Code (IaC):** CloudFormation and AWS CDK pipeline stacks.
   - **Multi-stage Dockerfiles:** Highly optimized production images for NestJS and Angular (Nginx).
   - **Zero-Downtime Database Migrations:** Forward-compatible TypeORM migrations with safe indexing and rollback scripts.
   - **AWS CodePipeline:** Automated multi-stage pipeline: Source ➔ Test (Jest + Supertest) ➔ Zero-Downtime Migration ➔ Staging Deploy ➔ Manual Approval Gate ➔ Production Deploy with **One-Click Rollback**.
   - **Lighthouse Performance Score 90+:** Optimized bundle sizes, asset compression (Gzip), responsive semantic HTML, and caching headers.

---

## 🏗️ Architecture Overview

```
                          ┌───────────────────────────┐
                          │   AWS ALB (Port 80/443)   │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
      Path: /*   ▼                                  Path: /api/*, /socket.io/*
  ┌───────────────────────────────┐              ┌───────────────────────────────┐
  │  Angular Frontend (Nginx)     │              │  NestJS Backend (ECS Fargate) │
  │  - Profile Management Screen  │              │  - REST Controllers           │
  │  - Real-Time Live Dashboard   │◄────────────►│  - WebSocket Gateway          │
  │  - Socket.io Client Service   │  WebSockets  │  - TypeORM Entity & Services  │
  └───────────────────────────────┘              └───────────────┬───────────────┘
                                                                 │
                                          ┌──────────────────────┴──────────────────────┐
                                          ▼                                             ▼
                             ┌────────────────────────┐                    ┌────────────────────────┐
                             │  Amazon RDS PostgreSQL │                    │  Amazon S3 Bucket      │
                             │  - Users & Profiles    │                    │  - User Avatar Files   │
                             │  - Aggregated Logs     │                    └────────────────────────┘
                             └────────────────────────┘
```

---

## 🚀 Quick Start (Local Docker Compose)

To spin up the entire production environment locally (PostgreSQL + NestJS Backend + Angular Frontend):

```bash
docker compose up --build
```

- **Angular Frontend:** [http://localhost:80](http://localhost:80) or [http://localhost:4200](http://localhost:4200)
- **NestJS Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Interactive Swagger Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **PostgreSQL Database:** `localhost:5432` (`user_platform_db`)

---

## 🛠️ Manual Development Setup

### 1. Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env

# Run TypeORM Migrations
npm run migration:run

# Seed Initial Reference Data
npm run seed

# Start in Watch Mode
npm run start:dev
```

### 2. Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Testing Suite (Jest & Supertest)

Run all unit tests with code coverage:

```bash
cd backend
npm run test -- --coverage
```

Run end-to-end (e2e) tests:

```bash
cd backend
npm run test:e2e
```

---

## 📦 Zero-Downtime Migrations & One-Click Rollback

### Running Migrations Safely on Staging/Production:
```bash
./devops/scripts/zero-downtime-migrate.sh
```

### One-Click Rollback Script:
If an issue occurs in a new deployment, run:
```bash
./devops/scripts/rollback.sh <cluster-name> <service-name>
```
This updates the ECS service to the previous task definition revision and prompts for safe database migration reversion.
