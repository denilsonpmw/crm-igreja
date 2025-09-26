import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../data-source';
import { Anexo } from '../entities/Anexo';
import { authorize } from '../middlewares/authorize';
import { tenantMiddleware } from '../middlewares/tenant';
import { recordAudit } from '../services/auditService';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

// Configuração do Multer para salvar arquivos localmente em /uploads
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Middleware multi-tenant e autorização
router.use(tenantMiddleware);

/**
 * @swagger
 * /attachments:
 *   post:
 *     summary: Faz upload de um arquivo e registra metadados
 *     tags: [Anexos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo a ser enviado
 *               entity_type:
 *                 type: string
 *                 example: membro
 *               entity_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Upload realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Anexo'
 *       400:
 *         description: Dados inválidos ou arquivo ausente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *     security:
 *       - bearerAuth: []
 *     x-codeSamples:
 *       - lang: curl
 *         label: Exemplo com JWT
 *         source: |
 *           curl -X POST \
 *             'http://localhost:3000/attachments' \
 *             -H 'Authorization: Bearer {SEU_TOKEN_JWT}' \
 *             -F 'file=@/caminho/para/arquivo.pdf' \
 *             -F 'entity_type=membro' \
 *             -F 'entity_id={UUID}'
 */
router.post('/', authMiddleware, authorize('attachments', 'create'), upload.single('file'), async (req, res) => {
  try {
    const { entity_type, entity_id } = req.body;
    const file = req.file;
    
  // Preferir valores em res.locals (definidos pelo auth middleware)
  const congFromLocals = (res && (res as any).locals && (res as any).locals.congregacao_id) ? (res as any).locals.congregacao_id : (req as any).congregacao_id;
  const userFromLocals = (res && (res as any).locals && (res as any).locals.user_id) ? (res as any).locals.user_id : (req as any).user_id;
    
    // Debug do banco de dados sendo usado
    const dataSource = AppDataSource;
    logger.info('[UPLOAD DATABASE DEBUG] DataSource info:', {
      isInitialized: dataSource.isInitialized,
      driver: dataSource.driver?.constructor.name,
      database: dataSource.options.database,
      type: dataSource.options.type,
      url: process.env.DATABASE_URL ? 'PostgreSQL from DATABASE_URL' : 'SQLite default'
    });
    
    // Debug das variáveis antes da validação (usar res.locals quando disponível)
    const congregacao_id = congFromLocals;
    const user_id = userFromLocals;

    // Log sucinto com informações não sensíveis
    logger.info('[UPLOAD] file:', file ? file.originalname : null, 'entity:', entity_type, 'entity_id:', entity_id);

    if (!file || !entity_type || !entity_id || !congregacao_id) {
      logger.warn('[UPLOAD ERROR] Campos obrigatórios ausentes', { file: !!file, entity_type, entity_id, congregacao_id });
      return res.status(400).json({ error: 'Arquivo, entidade e congregação são obrigatórios' });
    }

    const anexoRepo = AppDataSource.getRepository(Anexo);
    // Evitar passar null, apenas undefined para campos opcionais
    const anexo = anexoRepo.create({
      congregacao_id: String(congregacao_id),
      entity_type: String(entity_type),
      entity_id: String(entity_id),
      file_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: user_id ? String(user_id) : undefined,
      virus_scan_status: 'pending'
    });
    const saved = await anexoRepo.save(anexo);

    await recordAudit({
      user_id,
      congregacao_id,
      action: 'CREATE',
      resource_type: 'anexos',
      resource_id: saved.id,
      new_values: saved
    });

    res.status(201).json(saved);
  } catch (error) {
    logger.error('Erro no upload de anexo:', error);
    res.status(500).json({ error: 'Erro interno ao fazer upload' });
  }
});

export default router;
