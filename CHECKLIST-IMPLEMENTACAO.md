# Checklist de Implementação – CRM para Igrejas (Roadmap V2.0)

## Fase 0 – Infraestrutura & DevOps
- [x] Ambiente de desenvolvimento containerizado (Docker Compose)
- [ ] Redis para sessões/cache
- [ ] Pipeline CI/CD (GitHub Actions)
- [x] Configuração do PostgreSQL com migrations (TypeORM)
- [x] Variáveis de ambiente com dotenv
- [x] Seed de dados automatizado
- [x] Testes automatizados (Jest)
- [x] Lint e scripts de build/test
- [x] Logs simples (logger custom)
- [ ] Monitoramento básico com PM2
- [ ] Documentação da API com Swagger
- [ ] Rate limiting básico (express-rate-limit)
- [ ] Backup com pg_dump agendado

## Fase 1 – Fundação Essencial
- [x] Sistema de autenticação JWT
- [x] CRUD de usuários
- [x] CRUD de roles e permissões
- [x] Cadastro de membros e famílias
- [x] Multi-tenancy básico (estrutura de entidades)
- [x] Migrations e estrutura de banco
- [ ] Sistema de auditoria completa
- [ ] Importação de dados via CSV/Excel
- [ ] Histórico espiritual com timeline
- [ ] Dashboard administrativo básico
- [ ] Sistema de busca com PostgreSQL Full-Text Search
- [ ] Upload de arquivos local com Multer
- [ ] Configurações em JSON no banco
- [ ] Backup manual via interface

## Fase 2 – Comunicação & Acompanhamento
- [ ] Templates simples em HTML/texto
- [ ] Processamento com node-cron para emails em lote
- [ ] Integração WhatsApp (Evolution API)
- [ ] Envio de emails via Nodemailer
- [ ] SMS via Twilio
- [ ] Segmentação avançada de público-alvo
- [ ] Agendamento de mensagens
- [ ] Agenda pastoral digital
- [ ] Pedidos de oração
- [ ] Alertas de ausência
- [ ] Follow-up automatizado
- [ ] Relatórios de engajamento pastoral
- [ ] Sistema de notificações automatizadas

## Fase 3 – Gestão Financeira
- [ ] Gestão de dízimos, ofertas e doações
- [ ] Integração Pix QR Code
- [ ] Gateway Mercado Pago
- [ ] Controle de campanhas financeiras
- [ ] Recibos em PDF
- [ ] Controle de despesas
- [ ] Relatórios financeiros
- [ ] Gráficos com Chart.js
- [ ] Exportação para Excel
- [ ] Conciliação bancária
- [ ] Compliance/auditoria financeira

## Fase 4 – Educação & Eventos
- [ ] Gestão de cursos/turmas
- [ ] Certificados digitais
- [ ] Portal do aluno
- [ ] Inscrições online
- [ ] Controle de capacidade/lista de espera
- [ ] Check-in via QR Code
- [ ] Gestão logística de eventos
- [ ] Feedback pós-evento

## Fase 5 – Analytics & BI
- [ ] Dashboard executivo
- [ ] Relatórios avançados
- [ ] Data warehouse
- [ ] Integração BI externo

## Fase 6 – Mobile & Automação
- [ ] PWA responsivo
- [ ] App nativo (React Native)
- [ ] Notificações push
- [ ] Doações rápidas via app
- [ ] Acesso offline
- [ ] Chatbot WhatsApp
- [ ] Integração streaming
- [ ] Automação de workflows
- [ ] IA para engajamento

---

> Atualize este checklist conforme for implementando cada item. Priorize os itens marcados como essenciais para o MVP.
