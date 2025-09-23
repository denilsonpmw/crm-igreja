import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { recordAudit } from '../services/auditService';

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
function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj: any = {};
    headers.forEach((h, i) => obj[h] = cols[i] || '');
    return obj;
  });
}

// POST /import/members (multipart/form-data file field: file)
router.post('/members', async (req: any, res) => {
  // Lazy load multer to avoid type/dependency issues in minimal dev environments
  const multer = require('multer');
  const upload = multer({ dest: os.tmpdir() }).single('file');
  upload(req, res, async (err: any) => {
    if (err) return res.status(500).json({ message: 'Upload failed' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = req.file.path;
    const repo = AppDataSource.getRepository(Member);
    const created: Partial<Member>[] = [];
    const skipped: any[] = [];
  const errors: any[] = [];
    let parseStreamAvailable = false;
    let parser: any = null;
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
          const records: any[] = [];
          let lineCounter = 1; // header is line 1
          parser.on('readable', () => {
            let record: any;
            while ((record = parser.read()) !== null) {
              lineCounter += 1;
              records.push({ record, line: lineCounter });
            }
          });
          parser.on('error', (err2: any) => reject(err2));
          parser.on('end', async () => {
            try {
              // Process sequentially to avoid race conditions on duplicate checks
              for (const item of records) {
                const r = item.record;
                const lineno = item.line;
                const obj: any = {
                  nome: r.nome || r.name || '',
                  email: r.email || undefined,
                  telefone: r.telefone || r.phone || undefined,
                  cpf: r.cpf || undefined,
                  congregacao_id: req.congregacao_id || null,
                  created_by: req.user_id || null
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
                let existing: any = null;
                if (obj.cpf) {
                  existing = await repo.findOne({ where: { cpf: obj.cpf, congregacao_id: obj.congregacao_id } as any });
                }
                if (existing) {
                  skipped.push({ reason: 'duplicate_cpf', cpf: obj.cpf, existing_id: existing.membro_id, line: lineno });
                  try { await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'DUPLICATE_SKIPPED', resource_type: 'members', resource_id: existing.membro_id, new_values: obj, success: true, ip_address: req.ip || undefined, user_agent: (req.headers['user-agent'] as any) || undefined, session_id: (req.headers['x-session-id'] as any) || undefined }); } catch (e) { console.error('Audit error', e); }
                  continue;
                }
                const saved = await repo.save(repo.create(obj as any));
                created.push(saved as Partial<Member>);
                try { await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'CREATE', resource_type: 'members', resource_id: (saved as any).membro_id, new_values: saved, success: true, ip_address: req.ip || undefined, user_agent: (req.headers['user-agent'] as any) || undefined, session_id: (req.headers['x-session-id'] as any) || undefined }); } catch (e) { console.error('Audit error', e); }
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          rs.pipe(parser);
        });
      } else {
        // fallback to synchronous parser
        const content = fs.readFileSync(filePath, 'utf8');
        const rows = parseCsv(content);
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const lineno = i + 2; // header is line 1
          const obj: any = {
            nome: r.nome || r.name || '',
            email: r.email || undefined,
            telefone: r.telefone || r.phone || undefined,
            cpf: r.cpf || undefined,
            congregacao_id: req.congregacao_id || null,
            created_by: req.user_id || null
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
          let existing: any = null;
          if (obj.cpf) {
            existing = await repo.findOne({ where: { cpf: obj.cpf, congregacao_id: obj.congregacao_id } as any });
          }
          if (existing) {
            skipped.push({ reason: 'duplicate_cpf', cpf: obj.cpf, existing_id: existing.membro_id, line: lineno });
            try { await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'DUPLICATE_SKIPPED', resource_type: 'members', resource_id: existing.membro_id, new_values: obj, success: true, ip_address: req.ip || undefined, user_agent: (req.headers['user-agent'] as any) || undefined, session_id: (req.headers['x-session-id'] as any) || undefined }); } catch (e) { console.error('Audit error', e); }
            continue;
          }
          const saved = await repo.save(repo.create(obj as any));
          created.push(saved as Partial<Member>);
          try { await recordAudit({ user_id: req.user_id || undefined, congregacao_id: req.congregacao_id || undefined, action: 'CREATE', resource_type: 'members', resource_id: (saved as any).membro_id, new_values: saved, success: true, ip_address: req.ip || undefined, user_agent: (req.headers['user-agent'] as any) || undefined, session_id: (req.headers['x-session-id'] as any) || undefined }); } catch (e) { console.error('Audit error', e); }
        }
      }
      res.json({ createdCount: created.length, created, skippedCount: skipped.length, skipped, errorsCount: errors.length, errors });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to import' });
    } finally {
      try { fs.unlinkSync(filePath); } catch {};
    }
  });
});

export default router;
