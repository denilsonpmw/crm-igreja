# 📌 Roadmap Completo – CRM para Igrejas (V2.0)

## 🎯 Objetivo do Sistema

* Organizar membros, famílias, visitantes e novos convertidos.
* Acompanhar vida espiritual, administrativa e financeira.
* Melhorar comunicação entre **sede** e **congregações locais**.
* Sistema **100% web**, acessado via navegador.
* Permitir que o **Administrador da Sede** defina quais módulos cada congregação terá acesso.
* Delegar autonomia para que o **Admin-Congregação** gerencie os usuários locais.
* **[NOVO]** Sistema de auditoria completa e rastreabilidade de ações.
* **[NOVO]** Dashboard personalizável com KPIs em tempo real.
* **[NOVO]** Notificações inteligentes baseadas em eventos.

---

## 🏗️ Arquitetura Geral

### Stack Tecnológica Open Source

* **Backend Framework:** Express.js (TypeScript) - Simples e amplamente suportado
* **ORM:** Sequelize ou TypeORM - ORMs gratuitos e maduros
* **Banco Principal:** PostgreSQL 15 (auto-hospedado)
* **Cache:** Redis (auto-hospedado) - Sessões e cache básico
* **Processamento Assíncrono:** Node-cron + Worker threads - Tarefas agendadas simples
* **Busca:** PostgreSQL Full-Text Search - Busca nativa do banco
* **Frontend:** React 18+ com TypeScript
* **State Management:** Context API + useReducer - Nativo do React
* **UI Framework:** Tailwind CSS + React Hook Form
* **API:** REST puro - Simples e direto
* **Validação:** Joi ou Yup - Validação robusta e gratuita
* **Monitoramento:** PM2 + logs nativos - Monitoramento básico
* **Logs:** Winston com arquivos locais
* **Autenticação:** JWT simples + bcrypt (CPF + senha)
* **Hospedagem:** VPS (Contabo/DigitalOcean) + Docker

### Arquitetura de Domínios

```typescript
// Estrutura modular por domínios
const domains = {
  "auth": "Autenticação e autorização",
  "user-management": "Gestão de usuários e congregações", 
  "member": "Gestão de membros e famílias",
  "financial": "Movimentações financeiras",
  "communication": "Mensagens e notificações",
  "event": "Eventos e calendário",
  "reporting": "Relatórios e analytics",
  "audit": "Auditoria e logs do sistema"
};
```

---

## 🔑 Controle de Acesso Avançado

### 1. Multi-tenant Aprimorado

* Cada congregação é um *tenant* com isolamento completo de dados.
* Schema segregation por `congregacao_id`.
* **[NOVO]** Configurações personalizáveis por congregação.

### 2. RBAC Granular

```typescript
interface Permission {
  resource: string;     // 'members', 'finances', 'events'
  action: string;       // 'create', 'read', 'update', 'delete'
  scope: 'own' | 'congregation' | 'all';
  conditions?: {        // Condições especiais
    departamento?: string[];
    status_membro?: string[];
    valor_maximo?: number;
  };
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  hierarchyLevel: number;  // Para herança de permissões
  congregation_id?: string; // null para roles globais
}
```

### 3. JWT Claims Aprimorados

```typescript
interface JWTClaims {
  user_id: string;
  congregacao_id: string | null;
  roles: string[];
  permissions: Permission[];
  modulosLiberados: string[];
  sessionId: string;        // Para invalidar sessões
  plano: 'basico' | 'premium'; // Somente 2 planos para simplificar
  limites: {
    max_members: number;     // Limite simples por congregação
    storage_mb: number;      // Limite de storage básico
  };
  exp: number;
  iat: number;
}
```

### 4. Gestão de Usuários Hierárquica

* **Admin-Sede:** Controle total, criação de Admin-Congregação, definição de planos.
* **Admin-Congregação:** Gestão local completa dentro dos limites do plano.
* **Roles Especializadas:** Tesoureiro, Secretário, Líder, Pastor, Diácono.
* **[NOVO]** Aprovação em duas etapas para ações críticas.
* **[NOVO]** Rotação automática de credenciais administrativas.

---

## 📊 Roadmap de Implementação

### **Fase 0 – Infraestrutura & DevOps (4-6 semanas)**

#### Setup da Base Tecnológica
* Configuração do ambiente de desenvolvimento (Docker, Docker Compose)
* Pipeline CI/CD básico (GitHub Actions gratuito)
* Configuração do PostgreSQL com migrations (Sequelize/TypeORM)
* Setup do Redis básico para sessões
* Logs simples com Winston + arquivos locais
* Monitoramento básico com PM2
* Testes automatizados (Jest + Supertest)
* Documentação da API com Swagger gratuito
* **[SIMPLIFICADO]** Rate limiting básico com express-rate-limit
* **[SIMPLIFICADO]** Backup com pg_dump agendado
* **[SIMPLIFICADO]** Variáveis de ambiente com dotenv

#### Entregáveis
- [ ] Ambiente de desenvolvimento containerizado
- [ ] Pipeline de deploy automatizado
- [ ] Documentação técnica inicial
- [ ] Testes de carga básicos

---

### **Fase 1 – Fundação Essencial (8-10 semanas)**

#### Core do Sistema
* Sistema de autenticação JWT com refresh tokens
* Middleware de multi-tenancy
* CRUD de congregações e configurações
* Sistema de roles e permissões granulares
* Cadastro completo de membros e famílias
* Registro de visitantes e novos convertidos
* Histórico espiritual com timeline
* **[NOVO]** Sistema de auditoria completa
* **[NOVO]** Importação de dados via CSV/Excel
* **[SIMPLIFICADO]** Validação com Joi ou Yup
* **[SIMPLIFICADO]** Criptografia básica com crypto nativo do Node.js

#### Funcionalidades Base
* Calendário de cultos/eventos com recorrência
* Controle de ministérios e escalas de serviço
* Dashboard inicial com métricas básicas
* Sistema de busca com PostgreSQL Full-Text Search
* **[SIMPLIFICADO]** Upload de arquivos local com Multer
* **[SIMPLIFICADO]** Configurações em JSON no banco
* **[SIMPLIFICADO]** Backup manual via interface

#### Entregáveis
- [ ] Sistema de login e gestão de usuários
- [ ] CRUD completo de membros e famílias
- [ ] Dashboard administrativo básico
- [ ] Sistema de auditoria funcionando
- [ ] Documentação de APIs

---

### **Fase 2 – Comunicação & Acompanhamento (6-8 semanas)**

#### Sistema de Comunicação
* **[SIMPLIFICADO]** Templates simples em HTML/texto
* **[SIMPLIFICADO]** Processamento com node-cron para emails em lote
* Integração com WhatsApp via API gratuita (Evolution API)
* Envio de emails via Nodemailer + Gmail SMTP (gratuito até 500/dia)
* SMS via Twilio ou similar
* **[NOVO]** Segmentação avançada de público-alvo
* **[NOVO]** Agendamento de mensagens

#### Acompanhamento Pastoral
* Agenda pastoral (visitas, aconselhamentos)
* Pedidos de oração com privacidade
* **[NOVO]** Alertas inteligentes de ausência em cultos
* **[NOVO]** Sistema de follow-up automatizado
* **[NOVO]** Relatórios de engajamento pastoral

#### Notificações Inteligentes
* **[NOVO]** Sistema de regras de notificação
* **[NOVO]** Notificações push para app web
* **[NOVO]** Alertas por email para eventos importantes
* **[NOVO]** Dashboard de comunicação com métricas

#### Entregáveis
- [ ] Sistema de envio de mensagens em massa
- [ ] Agenda pastoral digital
- [ ] Relatórios de comunicação
- [ ] Sistema de notificações automatizadas

---

### **Fase 3 – Gestão Financeira (6-8 semanas)**

#### Core Financeiro
* Gestão completa de dízimos, ofertas e doações
* **[SIMPLIFICADO]** Integração básica com Pix via QR Code estático
* **[SIMPLIFICADO]** Gateway simples com Mercado Pago (gratuito para pequenos volumes)
* Controle de campanhas financeiras
* **[SIMPLIFICADO]** Recibos em PDF com jsPDF
* **[SIMPLIFICADO]** Controle básico de despesas

#### Relatórios Básicos
* Relatórios financeiros simples por congregação
* **[SIMPLIFICADO]** Gráficos com Chart.js (gratuito)
* **[SIMPLIFICADO]** Relatórios básicos de entrada/saída
* **[SIMPLIFICADO]** Exportação para Excel com xlsx
* **[NOVO]** Conciliação bancária semi-automática

#### Compliance e Auditoria
* **[NOVO]** Rastro completo de movimentações
* **[NOVO]** Aprovação em níveis para gastos altos
* **[NOVO]** Relatórios para prestação de contas
* **[NOVO]** Integração com sistemas contábeis

#### Entregáveis
- [ ] Sistema financeiro completo
- [ ] Integração com Pix e cartões
- [ ] Dashboard financeiro avançado
- [ ] Relatórios de prestação de contas

---

### **Fase 4 – Educação & Eventos (4-6 semanas)**

#### Gestão Educacional
* Controle de turmas/cursos de formação
* Registro de frequência automatizado
* **[NOVO]** Certificados digitais com QR Code
* **[NOVO]** Portal do aluno com acesso a materiais
* **[NOVO]** Avaliações online

#### Gestão de Eventos
* Inscrições online com formulários customizáveis
* **[NOVO]** Controle de capacidade e lista de espera
* **[NOVO]** Check-in via QR Code
* **[NOVO]** Gestão logística completa (recursos, voluntários)
* **[NOVO]** Feedback pós-evento automatizado

#### Entregáveis
- [ ] Sistema de cursos e certificações
- [ ] Plataforma de eventos online
- [ ] Portal do membro/aluno
- [ ] Sistema de avaliações

---

### **Fase 5 – Analytics & Business Intelligence (4-6 semanas)**

#### Dashboard Executivo
* **[NOVO]** KPIs personalizáveis por congregação
* **[NOVO]** Análise de crescimento e retenção
* **[NOVO]** Métricas de engajamento detalhadas
* **[NOVO]** Comparativos entre congregações

#### Relatórios Avançados
* **[NOVO]** Relatórios preditivos com ML básico
* **[NOVO]** Análise de frequência e padrões
* **[NOVO]** Segmentação de membros por comportamento
* **[NOVO]** Exportação automatizada para liderança

#### Business Intelligence
* **[NOVO]** Data warehouse para análises históricas
* **[NOVO]** Integração com Power BI/Tableau
* **[NOVO]** APIs para ferramentas externas
* **[NOVO]** Alertas automáticos sobre métricas críticas

#### Entregáveis
- [ ] Dashboard executivo completo
- [ ] Sistema de relatórios avançados
- [ ] Data warehouse funcional
- [ ] Integração com ferramentas de BI

---

### **Fase 6 – Mobile & Automação (8-10 semanas)**

#### Aplicativo Mobile/PWA
* **[NOVO]** PWA responsivo para membros
* **[NOVO]** App nativo iOS/Android (React Native)
* **[NOVO]** Notificações push nativas
* **[NOVO]** Doações rápidas via app
* **[NOVO]** Acesso offline para funções básicas

#### Automação Avançada
* **[NOVO]** Chatbot inteligente no WhatsApp
* **[NOVO]** Integração com transmissões ao vivo
* **[NOVO]** Automação de workflows administrativos
* **[NOVO]** IA para sugestões de engajamento

#### Integrações Externas
* **[NOVO]** API para sistemas de som/transmissão
* **[NOVO]** Integração com YouTube/Facebook Live
* **[NOVO]** Conexão com sistemas de presença (beacons/QR)
* **[NOVO]** Integração com agenda Google/Outlook

#### Entregáveis
- [ ] Aplicativo mobile funcional
- [ ] Sistema de automação completo
- [ ] Integrações com plataformas de streaming
- [ ] Chatbot operacional

---

## 🗄️ Estrutura de Banco Completa

### Tabelas Core (Existentes + Melhoradas)

```sql
-- Usuários com campos adicionais
CREATE TABLE usuarios (
  usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  roles TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  telefone VARCHAR(20),
  ultimo_login TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Congregações expandidas
CREATE TABLE congregacoes (
  congregacao_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  cnpj VARCHAR(20),
  pastor_principal VARCHAR(255),
  plano VARCHAR(50) DEFAULT 'basico',
  limite_membros INTEGER DEFAULT 100,
  limite_storage_mb INTEGER DEFAULT 500,
  limite_mensagens_mes INTEGER DEFAULT 1000,
  ativo BOOLEAN DEFAULT true,
  data_fundacao DATE,
  logo_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membros com campos expandidos
CREATE TABLE membros (
  membro_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  familia_id UUID REFERENCES familias(familia_id),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14), -- Criptografado
  data_nascimento DATE,
  sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
  estado_civil VARCHAR(20),
  profissao VARCHAR(100),
  telefone VARCHAR(20), -- Criptografado
  email VARCHAR(255),
  endereco TEXT, -- Criptografado
  cep VARCHAR(10),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  data_conversao DATE,
  data_batismo DATE,
  status VARCHAR(20) DEFAULT 'ativo',
  ministerios TEXT[],
  observacoes TEXT,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabelas Novas de Auditoria e Segurança

```sql
-- Auditoria completa
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(usuario_id),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN
  resource_type VARCHAR(50) NOT NULL, -- usuarios, membros, eventos
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessões de usuário
CREATE TABLE user_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES usuarios(usuario_id),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  refresh_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações por congregação
CREATE TABLE congregacao_configs (
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  data_type VARCHAR(20) DEFAULT 'string',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (congregacao_id, config_key)
);

-- Anexos e documentos
CREATE TABLE anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  checksum VARCHAR(64),
  uploaded_by UUID REFERENCES usuarios(usuario_id),
  virus_scan_status VARCHAR(20) DEFAULT 'pending',
  virus_scan_result VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  user_id UUID REFERENCES usuarios(usuario_id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Templates de mensagens
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- email, sms, whatsapp
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES usuarios(usuario_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabelas de Comunicação e Finanças

```sql
-- Campanhas de comunicação
CREATE TABLE communication_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- email, sms, whatsapp
  template_id UUID REFERENCES message_templates(id),
  target_criteria JSONB NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES usuarios(usuario_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Movimentações financeiras expandidas
CREATE TABLE financeiro_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  membro_id UUID REFERENCES membros(membro_id),
  tipo VARCHAR(30) NOT NULL, -- dizimo, oferta, doacao, despesa
  categoria VARCHAR(50),
  valor DECIMAL(15,2) NOT NULL,
  data_movimento DATE NOT NULL,
  data_registro TIMESTAMP DEFAULT NOW(),
  forma_pagamento VARCHAR(20), -- dinheiro, pix, cartao, boleto
  referencia_externa VARCHAR(100), -- ID do pagamento online
  comprovante_url TEXT,
  observacoes TEXT, -- Criptografado
  aprovado_por UUID REFERENCES usuarios(usuario_id),
  status VARCHAR(20) DEFAULT 'pendente',
  created_by UUID REFERENCES usuarios(usuario_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Metas e orçamentos
CREATE TABLE orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  congregacao_id UUID REFERENCES congregacoes(congregacao_id),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  valor_orcado DECIMAL(15,2) NOT NULL,
  valor_realizado DECIMAL(15,2) DEFAULT 0,
  observacoes TEXT,
  created_by UUID REFERENCES usuarios(usuario_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(congregacao_id, ano, mes, categoria)
);
```

---

## 🔒 Segurança Avançada

### Rate Limiting e Proteção

```typescript
// Rate limiting simples com express-rate-limit
const rateLimits = {
  // Autenticação
  login: {
    windowMs: 15 * 60 * 1000,      // 15 minutos
    max: 5,                        // 5 tentativas
    message: 'Muitas tentativas de login'
  },
  
  // APIs gerais
  api: {
    windowMs: 60 * 60 * 1000,      // 1 hora
    max: 500,                      // 500 requests por usuário (reduzido)
    standardHeaders: true
  },
  
  // Upload de arquivos
  upload: {
    windowMs: 60 * 1000,           // 1 minuto
    max: 5,                        // 5 uploads (reduzido)
    message: 'Muitos uploads. Tente novamente em 1 minuto.'
  }
};
```

### Criptografia Simples

```typescript
// Criptografia básica com crypto nativo do Node.js
const encryptedFields = {
  membros: ['cpf', 'telefone'], // Apenas dados mais sensíveis
  usuarios: ['telefone'],
  encryption: {
    algorithm: 'aes-256-cbc',     // Algoritmo mais simples
    key: process.env.CRYPTO_KEY   // Chave única via variável de ambiente
  }
};
```

### Monitoramento Básico

```typescript
// Monitoramento básico com logs simples
const basicMonitoring = {
  alerts: [
    'multiple_failed_logins',      // Múltiplas tentativas de login
    'permission_violation',        // Violação de permissão básica
    'server_error'                 // Erros do servidor
  ],
  
  logging: {
    level: 'info',
    format: 'simple',              // Formato simples de logs
    retention: '30 days',          // Retenção menor
    destination: 'files'           // Arquivos locais apenas
  }
};
```

---

## 📈 Métricas Básicas

### KPIs Simplificados

```typescript
const basicKPIs = {
  performance: {
    api_response_time: '< 500ms',   // Meta mais relaxada
    uptime_target: '99%'            // Meta mais realista
  },
  
  business: {
    congregacoes_ativas: 'contagem simples',
    membros_totais: 'contagem simples',
    uso_mensal: 'estatísticas básicas'
  }
};
```

### Dashboard Básico para Congregações

```typescript
const basicDashboard = {
  crescimento: {
    novos_membros_mes: 'número simples',
    visitantes_convertidos: 'taxa de conversão',
    membros_ativos: 'frequência > 75%',
    taxa_retencao: 'últimos 12 meses'
  },
  
  engajamento: {
    frequencia_media_cultos: '%',
    participacao_ministerios: '%',
    eventos_participacao: 'média por evento',
    comunicacao_abertura: 'taxa de abertura emails/mensagens'
  },
  
  financeiro: {
    dizimo_regularidade: '% membros regulares',
    ofertas_crescimento: 'variação mensal',
    campanhas_sucesso: 'meta vs realizado',
    despesas_categorias: 'distribuição %'
  },
  
  pastoral: {
    visitas_realizadas: 'número/mês',
    aconselhamentos: 'número/mês',
    novos_convertidos: 'número/mês',
    batismos: 'número/trimestre'
  }
};
```

---

## 🚀 Funcionalidades Básicas e Práticas

### Automações Simples

```typescript
const basicFeatures = {
  // Funcionalidades básicas sem IA
  automation: {
    birthday_reminders: 'Lembretes automáticos de aniversário',
    absence_alerts: 'Alertas de ausência simples',
    event_reminders: 'Lembretes de eventos agendados',
    basic_reports: 'Relatórios automáticos mensais'
  }
};
```

### Integrações Gratuitas/Básicas

```typescript
const basicIntegrations = {
  streaming: {
    youtube_embed: 'Incorporação simples do YouTube',
    facebook_embed: 'Incorporação do Facebook Live'
  },
  
  payment_gateways: {
    pix_qr: 'QR Code Pix estático',
    mercadopago: 'Mercado Pago (plano gratuito)',
    pagseguro: 'PagSeguro básico'
  },
  
  communication: {
    evolution_api: 'WhatsApp via Evolution API (open source)',
    nodemailer: 'Email via Gmail SMTP (gratuito)',
    web_notifications: 'Notificações web nativas do browser'
  }
};
```
```

---

## ✅ Benefícios da V2.0

### Para a Organização
* **Escalabilidade Massiva:** Suporte a milhares de congregações simultaneamente.
* **Segurança Enterprise:** Criptografia, auditoria e compliance completos.
* **Insights Avançados:** BI e analytics para tomada de decisão estratégica.
* **Automação Inteligente:** Redução de 70% do trabalho manual administrativo.
* **Integração Total:** Conexão com todas as ferramentas já utilizadas.

### Para os Usuários
* **Interface Intuitiva:** UX/UI moderno e responsivo.
* **Acesso Móvel:** App nativo com funcionalidades offline.
* **Comunicação Eficiente:** Mensagens segmentadas e automatizadas.
* **Relatórios Instantâneos:** Dashboards em tempo real personalizáveis.
* **Suporte 24/7:** Chatbot inteligente + suporte humano.

### Para os Membros
* **Portal Personalizado:** Acesso a informações pessoais e da congregação.
* **Doações Simplificadas:** Pix, cartão e doações recorrentes.
* **Participação Ativa:** Inscrições em eventos, cursos e ministérios.
* **Comunicação Direta:** Recebimento de mensagens relevantes.
* **Certificados Digitais:** Comprovação de participação em cursos.

---

## 🎯 Próximos Passos

### Preparação para Desenvolvimento
1. **Definição de Equipe:** Frontend (2), Backend (3), DevOps (1), QA (1), Design (1)
2. **Setup de Ambiente:** Definição de infraestrutura e ferramentas
3. **Prototipação:** Criação de wireframes e protótipos navegáveis
4. **Arquitetura Detalhada:** Documentação técnica completa
5. **Plano de Testes:** Estratégia de testes automatizados e manuais

### Cronograma Estimado
* **Fase 0-1:** 3-4 meses (Fundação sólida)
* **Fase 2-3:** 3-4 meses (Funcionalidades core)
* **Fase 4-5:** 2-3 meses (Features avançadas)
* **Fase 6:** 2-3 meses (Mobile e automação)
* **Total:** 10-14 meses para MVP completo

### Cronograma Estimado (Equipe Menor - 4-5 pessoas)
* **Fase 0-1:** 4-5 meses (Fundação com ferramentas open source)
* **Fase 2-3:** 3-4 meses (Funcionalidades essenciais)
* **Fase 4-5:** 2-3 meses (Features básicas)
* **Fase 6:** 2-3 meses (Mobile PWA)
* **Total:** 11-15 meses para MVP funcional

### Orçamento Reduzido (Equipe 4-5 pessoas)
* **Desenvolvimento:** R$ 400.000 - R$ 600.000 (equipe menor)
* **Infraestrutura (1º ano):** R$ 24.000 - R$ 36.000 (VPS + domínios)
* **Ferramentas:** R$ 5.000 - R$ 10.000 (apenas essenciais pagas)
* **Marketing básico:** R$ 20.000 - R$ 40.000
* **Total Investimento:** R$ 449.000 - R$ 686.000

### Stack de Custos Detalhada
```typescript
const monthlyEoperationalCosts = {
  hosting: {
    vps_4gb: 'R$ 150/mês (Contabo/DigitalOcean)',
    domain: 'R$ 10/mês',
    ssl: 'R$ 0 (Let\'s Encrypt gratuito)',
    backup_storage: 'R$ 50/mês'
  },
  
  communication: {
    gmail_smtp: 'R$ 0 (até 500 emails/dia)',
    evolution_api: 'R$ 0 (self-hosted)',
    mercadopago: '2,99% por transação (sem taxa fixa)'
  },
  
  development: {
    github: 'R$ 0 (plano gratuito)',
    vercel_frontend: 'R$ 0 (plano hobby)',
    docker_hub: 'R$ 0 (plano gratuito)',
    monitoring: 'R$ 0 (logs básicos + PM2)'
  },
  
  total_monthly: 'R$ 210/mês aproximadamente'
};
```

---

*Este roadmap V2.0 simplificado foca em soluções open source e gratuitas, mantendo funcionalidade essencial mas reduzindo significativamente os custos de desenvolvimento e operação.*