# CRM-ADPS

Sistema de CRM para igrejas desenvolvido com Express.js, TypeScript e TypeORM.

## 🚀 Como executar

### 1. Configuração inicial

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env se necessário (JWT_SECRET, CRYPTO_KEY)
```

### 2. Executar localmente

**Opção A: Com SQLite (desenvolvimento)**
```bash
npm run dev
```
Servidor rodará em http://localhost:3001 usando SQLite local.

**Opção B: Com Docker e PostgreSQL**
```bash
docker compose up --build
```
Servidor rodará em http://localhost:3000 usando PostgreSQL.

## 📋 Endpoints disponíveis

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Fazer logout

### Membros
- `GET /members` - Listar membros
- `POST /members` - Criar membro

## 🧪 Testando os endpoints

### 1. Registrar usuário
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste Usuario","email":"teste@exemplo.com","senha":"123456"}'
```

### 2. Fazer login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","senha":"123456"}'
```

### 3. Listar membros
```bash
curl -X GET http://localhost:3001/members
```

### 4. Criar membro
```bash
curl -X POST http://localhost:3001/members \
  -H "Content-Type: application/json" \
  -d '{"nome":"João da Silva","cpf":"123.456.789-00","telefone":"(11) 99999-9999"}'
```

### 5. Script de teste automatizado
```bash
# Primeiro inicie o servidor
npm run dev

# Em outro terminal, execute:
./test-endpoints.sh
```

## 🛠️ Desenvolvimento

### Scripts disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Executar versão compilada

### Estrutura do projeto
```
src/
├── entities/          # Entidades TypeORM
│   ├── User.ts
│   ├── UserSession.ts
│   └── Member.ts
├── routes/            # Rotas da API
│   ├── auth.ts
│   └── members.ts
├── data-source.ts     # Configuração TypeORM
└── index.ts           # Entrada da aplicação
```

### Banco de dados
- **Desenvolvimento**: SQLite (dev.sqlite) - criado automaticamente
- **Produção**: PostgreSQL via Docker Compose

### Recursos implementados
✅ Autenticação JWT com refresh tokens  
✅ Sistema de sessões com rotação de tokens  
✅ Entidades User, UserSession e Member  
✅ CRUD básico de membros  
✅ Compatibilidade SQLite/PostgreSQL  
✅ Docker compose para produção