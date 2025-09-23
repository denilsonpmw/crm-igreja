#!/usr/bin/env bash
set -euo pipefail

# Script para iniciar um container Postgres local e executar migrations (usando dist/data-source.js)
# Uso: ./scripts/run-migrations-postgres.sh

PORT=5433
CONTAINER_NAME=crm-postgres
POSTGRES_USER=dev
POSTGRES_PASSWORD=pass
POSTGRES_DB=crm_dev
IMAGE=postgres:15

function check_docker() {
  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon não está acessível. Inicie o Docker Desktop / Orbstack e tente novamente." >&2
    exit 1
  fi
}

function start_postgres() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER_NAME" -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" -e POSTGRES_USER="$POSTGRES_USER" -e POSTGRES_DB="$POSTGRES_DB" -p "$PORT":5432 "$IMAGE"
}

function wait_ready() {
  echo "Aguardando postgres ficar pronto..."
  for i in $(seq 1 60); do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      echo "Postgres pronto"
      return 0
    fi
    sleep 1
  done
  echo "Timeout esperando Postgres" >&2
  exit 1
}

function run_migrations() {
  export DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$PORT/$POSTGRES_DB"
  echo "DATABASE_URL=$DATABASE_URL"
  # Garantir que a build JS exista (compila TS -> dist)
  echo "Compilando TypeScript (npm run build)..."
  npm run build
  # Se houver migrations compiladas em dist, use dist/data-source.js (JS);
  # caso contrário, execute o TypeORM CLI via ts-node-dev apontando para src/data-source.ts
  if [ -d "dist/migrations" ]; then
    export NODE_ENV=production
    echo "NODE_ENV=$NODE_ENV (usando arquivos .js em dist/)"
    npx typeorm migration:run -d dist/data-source.js
  else
    export NODE_ENV=development
    echo "NODE_ENV=$NODE_ENV (usando migrations em TypeScript via ts-node-dev)"
    npx ts-node-dev ./node_modules/typeorm/cli.js migration:run -d src/data-source.ts
  fi
  echo "-- migrations applied --"
  npx typeorm migration:show -d dist/data-source.js || true
}

function show_schema() {
  echo "-- esquema da tabela congregacoes --"
  docker exec "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\\d+ congregacoes" || true
}

check_docker
start_postgres
wait_ready
run_migrations
show_schema

echo "Pronto. Se quiser destruir o container: docker rm -f $CONTAINER_NAME"