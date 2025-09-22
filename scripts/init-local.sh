#!/usr/bin/env bash
# Script de inicialização local - macOS
# Uso:
#   chmod +x scripts/init-local.sh
#   ./scripts/init-local.sh

set -euo pipefail

echo "=== Início do setup local ==="

# 1) .env
if [ -f .env ]; then
  echo "Arquivo .env já existe"
else
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ".env criado a partir de .env.example"
  else
    echo "Aviso: .env.example não encontrado. Crie .env manualmente."
  fi
fi

# Nota: Não adicionamos DATABASE_URL no .env automaticamente.
# O app faz fallback para SQLite em ./dev.sqlite quando DATABASE_URL não está setada.

# 2) Instalar dependências
echo "Instalando dependências (npm install)..."
npm install

# 3) Detectar ORM (TypeORM ou Sequelize)
echo "Detectando ORM no package.json..."
ORM="unknown"
if node -e "try{const p=require('./package.json'); process.stdout.write(((p.dependencies&&p.dependencies.typeorm)||(p.devDependencies&&p.devDependencies.typeorm))?\"true\":\"false\");}catch(e){process.stdout.write('false')}" | grep -q true; then
  ORM="typeorm"
elif node -e "try{const p=require('./package.json'); process.stdout.write(((p.dependencies&&p.dependencies.sequelize)||(p.devDependencies&&p.devDependencies.sequelize))?\"true\":\"false\");}catch(e){process.stdout.write('false')}" | grep -q true; then
  ORM="sequelize"
fi
echo "ORM detectado: $ORM"

# 4) Rodar migrations se aplicável
if [ "$ORM" = "typeorm" ]; then
  echo "Executando migrations TypeORM..."
  if npm run typeorm:migration:run --silent 2>/dev/null; then
    echo "Migrations TypeORM aplicadas."
  else
    echo "Comando padrão de migrations TypeORM falhou. Tente: npm run typeorm:migration:run"
  fi
elif [ "$ORM" = "sequelize" ]; then
  echo "Executando migrations Sequelize..."
  if npx sequelize db:migrate --env development 2>/dev/null; then
    echo "Migrations Sequelize aplicadas."
  else
    echo "Comando de migrations Sequelize falhou. Tente: npx sequelize db:migrate --env development"
  fi
else
  echo "Nenhum ORM detectado. Pule step de migrations."
fi

# Rodar seed (scripts/seed.ts) para criar roles e usuário admin se existir
if [ -f "scripts/seed.ts" ]; then
  echo "Rodando seed (scripts/seed.ts) com ts-node..."
  if npx ts-node scripts/seed.ts; then
    echo "Seed executado com sucesso."
  else
    echo "Falha ao executar seed. Se necessário, rode: npx ts-node scripts/seed.ts"
  fi
else
  echo "Nenhum seed encontrado em scripts/seed.ts. Pulando seed."
fi

# 5) Start em modo dev (hot-reload)
echo "Iniciando servidor em modo dev (npm run dev)..."
# roda em foreground; se preferir em background, acrescente '&' no final

# Garantir que o arquivo SQLite exista e tenha permissões
if [ -f "./dev.sqlite" ]; then
  echo "Arquivo dev.sqlite já existe"
else
  touch ./dev.sqlite
  chmod 664 ./dev.sqlite || true
  echo "Arquivo dev.sqlite criado"
fi

npm run dev

echo "=== Setup local finalizado ==="
