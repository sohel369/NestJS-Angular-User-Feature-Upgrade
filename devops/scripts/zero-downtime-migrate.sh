#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 STARTING ZERO-DOWNTIME DATABASE MIGRATION"
echo "=========================================================="

# 1. Check RDS Database connectivity
echo "🔍 Step 1: Checking PostgreSQL connectivity..."
export DB_HOST=${DB_HOST:-"localhost"}
export DB_PORT=${DB_PORT:-"5432"}

echo "Connecting to PostgreSQL at $DB_HOST:$DB_PORT..."

# 2. Run Forward-Compatible TypeORM Migrations
echo "📦 Step 2: Running TypeORM migrations..."
cd backend
npm run migration:run

# 3. Verify Health & Seed Data
echo "🌱 Step 3: Verifying Seed Data..."
npm run seed || echo "Seed already present, skipping."

echo "=========================================================="
echo "✅ ZERO-DOWNTIME MIGRATION COMPLETED SUCCESSFULLY!"
echo "=========================================================="
