#!/usr/bin/env bash
# Script para rodar testes usando um container Postgres temporário via Docker.
# Fluxo:
# 1) Se DATABASE_URL estiver definido, usa-o.
# 2) Caso contrário, cria um container Postgres temporário (nome: crm_adps_test_db) na porta 5433
# 3) Aguarda o Postgres ficar pronto, exporta DATABASE_URL e executa jest
# 4) Ao final, remove o container criado

set -euo pipefail

CONTAINER_NAME="crm_adps_test_db"
PG_USER="postgres"
PG_PASS="postgres"
PG_DB="crm_test"
# Escolher porta livre entre 5432..5440
HOST_PORT=""
for port in {5432..5440}; do
  if ! lsof -iTCP:${port} -sTCP:LISTEN -t >/dev/null 2>&1; then
    HOST_PORT=$port
    break
  fi
done
if [ -z "$HOST_PORT" ]; then
  echo "Nenhuma porta livre encontrada entre 5432..5440"
  exit 1
fi

started_container=false

function cleanup() {
  if [ "$started_container" = true ]; then
    echo "Removendo container $CONTAINER_NAME..."
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

if [ -z "${DATABASE_URL-}" ]; then
  # Se já existe um Postgres escutando na porta padrão 5432 e credenciais padrão,
  # preferimos não sobrescrever. Checamos se é possível conectar com essas credenciais.
  echo "DATABASE_URL não definida — criando container Postgres de teste ($CONTAINER_NAME) na porta $HOST_PORT"

  # Se existir container com mesmo nome, tenta removê-lo
  if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
    echo "Removendo container antigo chamado $CONTAINER_NAME"
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi

  echo "Iniciando container Postgres na porta $HOST_PORT..."
  started_container=false
  for try_port in {5432..5440}; do
    if docker run -d --name "$CONTAINER_NAME" -e POSTGRES_USER="$PG_USER" -e POSTGRES_PASSWORD="$PG_PASS" -e POSTGRES_DB="$PG_DB" -p ${try_port}:5432 postgres:15 >/dev/null 2>&1; then
      HOST_PORT=$try_port
      started_container=true
      break
    else
      echo "porta $try_port ocupada, tentando próxima..."
      # remover container se for criado parcialmente
      docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
      continue
    fi
  done

  if [ "$started_container" != true ]; then
    echo "Falha ao iniciar container Postgres — nenhuma porta disponível"
    exit 1
  fi

  echo "Aguardando Postgres ficar pronto na porta $HOST_PORT..."
  # aguardar com pg_isready
  until pg_isready -q -h localhost -p ${HOST_PORT} -U "$PG_USER"; do
    sleep 0.5
  done

  export DATABASE_URL="postgres://${PG_USER}:${PG_PASS}@localhost:${HOST_PORT}/${PG_DB}"
else
  echo "Usando DATABASE_URL existente"
fi

echo "Rodando testes com DATABASE_URL=$DATABASE_URL"

# Executar jest (pass-through de argumentos)
npx jest "$@"

