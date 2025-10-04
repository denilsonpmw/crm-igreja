# feat(auditoria): auditoria + upload de anexos, migrations e ajustes de testes

## Resumo

- Implementa sistema de auditoria e integra registro de ações para login, criação de membros e upload de anexos.
- Adiciona endpoint de upload de anexos e migration para a tabela `anexos`.
- Ajusta infra de testes para executar migrations automaticamente e corrige TestDataSource/jest.setup para evitar conflitos entre migrations e synchronize.
- Corrige bug que convertia `null` em string `"null"` no upload (campo `congregacao_id`).

## Principais alterações

- `migrations/1703000000000-CreateAnexosTable.ts` — nova migration para `anexos`.
- `src/routes/attachments.ts` — endpoint de upload (+ correção de null handling).
- `scripts/test_with_postgres.sh` — agora executa migrations antes dos testes.
- `.github/workflows/ci.yml` — executa migrations no job de testes backend.
- `package.json` — `test:coverage` agora executa migrations antes do Jest.
- `jest.setup.ts` — não chama `synchronize()` quando usando Postgres.
- `src/__tests__/helpers/testDataSource.ts` — inclui entidade `Anexo` e desabilita `synchronize` para Postgres.
- `src/__tests__/audit.test.ts` — teste de auditoria (login, criação de membro, upload).
- `src/__tests__/fixtures/arquivo_teste.txt` e helper auth para testes.
- `src/middlewares/authorize.ts` — normalização de roles/resources/actions (case-insensitive).

## Como testar localmente

1. npm install
2. npm test  # inicia container Postgres, executa migrations e roda jest

## Checklist para revisão

- [ ] Revisar migration `CreateAnexosTable`.
- [ ] Validar endpoint `/attachments` (upload + audit log).
- [ ] Conferir alterações no workflow CI e scripts de testes.
- [ ] Revisar testes novos/alterados e fixtures.
- [ ] Remover arquivos build/dist do commit se não desejados.

---

> Observação: o arquivo foi criado no branch `auditoria` e commitado no repositório para facilitar colagem da descrição no formulário do PR.