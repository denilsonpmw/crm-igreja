Infraestrutura - notas rápidas

Objetivo: instruções para rodar o projeto localmente e em Docker.

Rodando localmente (SQLite - desenvolvimento)

1. Instalar dependências

```bash
npm install
```

2. Copiar exemplo de variáveis de ambiente

```bash
cp .env.example .env
# edite .env se necessário
```

3. Rodar em modo desenvolvimento

```bash
npm run dev
```

Rodando com Docker Compose (Postgres)

```bash
# Levanta todos os serviços (inclui postgres se usar o profile)
docker compose --profile postgres up --build
```

Rodando em modo Docker para desenvolvimento (usa SQLite)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Migrations (TypeORM)

- Gerar migration:

```bash
npm run migration:generate -- -n NomeDaMigration
```

- Rodar migrations:

```bash
npm run migration:run
```

CI

- O arquivo `.github/workflows/ci.yml` roda `npm ci`, `npm run build` e `npm test`.

PM2

- Para rodar em produção com PM2:

```bash
npm run pm2:start
```

Observações

- Em produção não utilize `synchronize: true` no TypeORM; use migrations.
- Considere adicionar serviços externos no CI (Postgres) se desejar testes de integração.

Perfil Postgres

O `docker-compose.yml` define o serviço `db` com o profile `postgres`. Para levantar o Postgres localmente use:

```bash
docker compose --profile postgres up --build
```

Isso permite usar `docker compose up` normal para desenvolvimento leve (sem Postgres) e trazer o banco apenas quando necessário.
