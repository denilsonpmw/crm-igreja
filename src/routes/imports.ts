import express from 'express';
import { AppDataSource } from '../data-source';
import { Member } from '../entities/Member';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { recordAudit } from '../services/auditService';

const router = express.Router();
// We'll require multer lazily inside handler so project doesn't fail to compile if multer is not installed in dev env
// Simple CSV parser (header row expected). Returns array of objects keyed by header.
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
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCsv(content);
    const repo = AppDataSource.getRepository(Member);
  const created: Partial<Member>[] = [];
    for (const r of rows) {
      // map common fields: nome,email,telefone,cpf
      const obj: any = {
        nome: r.nome || r.name || '',
        // email is not part of Member entity by default in this project; keep as extra field if present
        email: r.email || undefined,
        telefone: r.telefone || r.phone || undefined,
        cpf: r.cpf || undefined,
        congregacao_id: req.congregacao_id || null,
        created_by: req.user_id || null
      };
      if (!obj.nome) continue; // skip invalid rows
      const member = repo.create(obj as any);
      const saved = await repo.save(member);
      created.push(saved as Partial<Member>);
      try { await recordAudit({ user_id: req.user_id || null, congregacao_id: req.congregacao_id || null, action: 'CREATE', resource_type: 'members', resource_id: (saved as any).membro_id, new_values: saved, success: true }); } catch (e) { console.error('Audit error', e); }
    }
    res.json({ createdCount: created.length, created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to import' });
  } finally {
    try { fs.unlinkSync(filePath); } catch {};
  }
  });
});

export default router;
