import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { recordAudit } from '../services/auditService';
import { logger } from '../utils/logger';

// Simple email regex (reasonable for validation, not fully RFC-complete)
function isValidEmail(email: string | undefined) {
  if (!email) return true; // optional field
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return re.test(email);
}

// CPF validation (Brazilian CPF) - accepts formatted or unformatted
function isValidCPF(cpf?: string) {
  if (!cpf) return true; // optional field
  const s = cpf.replace(/\D/g, '');
  return s.length === 11;
}

const router = express.Router();
// We'll require multer lazily inside handler so project doesn't fail to compile if multer is not installed in dev env
// Simple CSV parser (header row expected). Returns array of objects keyed by header.
// Keep a simple fallback parser but prefer csv-parse stream when available
function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
    return obj;
  });
}

// POST /import/members (multipart/form-data file field: file)
type MulterRequest = express.Request & { file?: Express.Multer.File; congregacao_id?: string | null; user_id?: string };

router.post('/members', async (req, res) => {
  const creq = req as MulterRequest;
  // Lazy load multer to avoid type/dependency issues in minimal dev environments
  const multer = require('multer');
  const upload = multer({ dest: os.tmpdir() }).single('file');
  upload(req, res, async (err: unknown) => {
    if (err) return res.status(500).json({ message: 'Upload failed' });
    // multer attaches file to the request; keep runtime behavior but guard typing
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = req.file.path;
    const repo = AppDataSource.getRepository(Member);
    const created: Partial<Member>[] = [];
    const skipped: Array<{ reason: string; cpf?: string; existing_id?: string; line?: number }> = [];
    const errors: Array<{ line: number; reason: string; raw?: unknown }> = [];
  let parseStreamAvailable = false;
  let parser: unknown = null;
    try {
      // try to require csv-parse dynamically
      try {
        const csv = require('csv-parse');
        parseStreamAvailable = true;
        parser = csv.parse({ columns: true, skip_empty_lines: true, trim: true });
      } catch (e) {
        parseStreamAvailable = false;
      }

      if (parseStreamAvailable && parser) {
        // stream through the file
        await new Promise<void>((resolve, reject) => {
          const rs = fs.createReadStream(filePath);
          rs.on('error', (e) => reject(e));
          const records: Array<{ record: Record<string, unknown>; line: number }> = [];
          let lineCounter = 1; // header is line 1
              // csv-parse uses a dynamic event API at runtime; provide a minimal typed subset
              interface CsvParser {
                on(event: 'readable', cb: () => void): void;
                on(event: 'error', cb: (err: unknown) => void): void;
                on(event: 'end', cb: () => void): void;
                read(): unknown;
              }
              const p = parser as CsvParser;
              p.on('readable', () => {
                // parser.read() returns unknown; read into a local var and guard
                let record: unknown;
                while ((record = p.read()) !== null) {
                  lineCounter += 1;
                  records.push({ record: record as Record<string, unknown>, line: lineCounter });
                }
              });
              p.on('error', (err2: unknown) => reject(err2));
              p.on('end', async () => {
            try {
              // Process sequentially to avoid race conditions on duplicate checks
              for (const item of records) {
                const r = item.record;
                const lineno = item.line;
                const rec = r as Record<string, unknown>;
                const obj: Partial<Member> & Record<string, unknown> = {
                  nome: (typeof rec.nome === 'string' ? rec.nome : (typeof rec.name === 'string' ? rec.name : '')) as string,
                  email: typeof rec.email === 'string' ? rec.email : undefined,
                  telefone: typeof rec.telefone === 'string' ? rec.telefone : (typeof rec.phone === 'string' ? rec.phone : undefined),
                  cpf: typeof rec.cpf === 'string' ? rec.cpf : undefined,
                  congregacao_id: req.congregacao_id ?? null,
                  created_by: req.user_id ?? null
                };
                if (!obj.nome) {
                  errors.push({ line: lineno, reason: 'missing_nome', raw: r });
                  continue;
                }
                if (!isValidEmail(obj.email)) {
                  errors.push({ line: lineno, reason: 'invalid_email', raw: r });
                  continue;
                }
                if (!isValidCPF(obj.cpf)) {
                  errors.push({ line: lineno, reason: 'invalid_cpf', raw: r });
                  continue;
                }
                let existing: unknown = null;
                if (obj.cpf) {
                  existing = await repo.findOne({ where: { cpf: obj.cpf, congregacao_id: obj.congregacao_id } as unknown as Record<string, unknown> });
                }
                if (existing) {
                  const existingId = (existing as unknown as { membro_id?: string }).membro_id;
                  skipped.push({ reason: 'duplicate_cpf', cpf: obj.cpf as string | undefined, existing_id: existingId, line: lineno });
                  try {
                    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
                    const sessionId = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'] : undefined;
                    await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'DUPLICATE_SKIPPED', resource_type: 'members', resource_id: existingId, new_values: obj, success: true, ip_address: req.ip || undefined, user_agent: userAgent, session_id: sessionId });
                  } catch (e) { logger.error('Audit error', e); }
                  continue;
                }
                const createdEntity = repo.create(obj as Partial<Member>);
                const saved = await repo.save(createdEntity);
                created.push(saved as Partial<Member>);
                try {
                  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
                  const sessionId = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'] : undefined;
                  await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'CREATE', resource_type: 'members', resource_id: (saved as unknown as { membro_id?: string }).membro_id, new_values: saved, success: true, ip_address: req.ip || undefined, user_agent: userAgent, session_id: sessionId });
                } catch (e) { logger.error('Audit error', e); }
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          // csv-parse stream doesn't have exact typings here; allow a single narrow cast
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rs.pipe(p as any);
        });
      } else {
        // fallback to synchronous parser
        const content = fs.readFileSync(filePath, 'utf8');
        const rows = parseCsv(content);
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const lineno = i + 2; // header is line 1
          const rec = r as Record<string, unknown>;
          const obj: Partial<Member> & Record<string, unknown> = {
            nome: (typeof rec.nome === 'string' ? rec.nome : (typeof rec.name === 'string' ? rec.name : '')) as string,
            email: typeof rec.email === 'string' ? rec.email : undefined,
            telefone: typeof rec.telefone === 'string' ? rec.telefone : (typeof rec.phone === 'string' ? rec.phone : undefined),
            cpf: typeof rec.cpf === 'string' ? rec.cpf : undefined,
            congregacao_id: creq.congregacao_id ?? null,
            created_by: creq.user_id ?? null
          };
          if (!obj.nome) {
            errors.push({ line: lineno, reason: 'missing_nome', raw: r });
            continue;
          }
          if (!isValidEmail(obj.email)) {
            errors.push({ line: lineno, reason: 'invalid_email', raw: r });
            continue;
          }
          if (!isValidCPF(obj.cpf)) {
            errors.push({ line: lineno, reason: 'invalid_cpf', raw: r });
            continue;
          }
          let existing: unknown = null;
          if (obj.cpf) {
            existing = await repo.findOne({ where: { cpf: obj.cpf, congregacao_id: obj.congregacao_id } as unknown as Record<string, unknown> });
          }
          if (existing) {
            const existingId = (existing as unknown as { membro_id?: string }).membro_id;
            skipped.push({ reason: 'duplicate_cpf', cpf: obj.cpf as string | undefined, existing_id: existingId, line: lineno });
            try {
              const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
              const sessionId = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'] : undefined;
              await recordAudit({ user_id: creq.user_id || undefined, congregacao_id: creq.congregacao_id || undefined, action: 'DUPLICATE_SKIPPED', resource_type: 'members', resource_id: existingId, new_values: obj, success: true, ip_address: req.ip || undefined, user_agent: userAgent, session_id: sessionId });
            } catch (e) { logger.error('Audit error', e); }
            continue;
          }
          const createdEntity = repo.create(obj as Partial<Member>);
          const saved = await repo.save(createdEntity);
          created.push(saved as Partial<Member>);
          try {
            const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined;
            const sessionId = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'] : undefined;
            await recordAudit({ user_id: creq.user_id || undefined, congregacao_id: creq.congregacao_id || undefined, action: 'CREATE', resource_type: 'members', resource_id: (saved as unknown as { membro_id?: string }).membro_id, new_values: saved, success: true, ip_address: req.ip || undefined, user_agent: userAgent, session_id: sessionId });
          } catch (e) { logger.error('Audit error', e); }
        }
      }
      res.json({ createdCount: created.length, created, skippedCount: skipped.length, skipped, errorsCount: errors.length, errors });
    } catch (err) {
      logger.error(err);
      res.status(500).json({ message: 'Failed to import' });
    } finally {
      try { fs.unlinkSync(filePath); } catch {};
    }
  });
});

export default router;
