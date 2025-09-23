import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Congregacao } from '../entities/Congregacao';
import { tenantMiddleware } from '../middlewares/tenant';
import { authorize } from '../middlewares/authorize';
import { recordAudit } from '../services/auditService';

const router = Router();

// Aplicar tenant simples para capturar header x-congregacao-id quando presente
router.use(tenantMiddleware);

// Lista com paginação e busca
router.get('/', authorize('congregations', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '25')));
    const search = (req.query.search as string) || '';

    const repo = AppDataSource.getRepository(Congregacao);
    let qb = repo.createQueryBuilder('c').orderBy('c.nome', 'ASC');
    if (search) qb = qb.where('c.nome ILIKE :search', { search: `%${search}%` });

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();

    // auditoria
    await recordAudit({
      user_id: (req as any).user_id,
      action: 'READ',
      resource_type: 'congregacoes',
      new_values: { action: 'list', page, limit, search },
    });

    res.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error listing congregations', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// Criar congregação
router.post('/', authorize('congregations', 'create'), async (req, res) => {
  try {
    const {
      nome, endereco, telefone, email, plano,
      website, cnpj, pastor_principal,
      limite_membros, limite_storage_mb, limite_mensagens_mes,
      ativo, data_fundacao, logo_url, configuracoes
    } = req.body;
    if (!nome || !nome.trim()) return res.status(400).json({ message: 'Missing nome' });

    const repo = AppDataSource.getRepository(Congregacao);
    // checar duplicidade por nome
    const existing = await repo.findOne({ where: { nome: nome.trim() } });
    if (existing) return res.status(409).json({ message: 'Já existe uma congregação com este nome' });

    const c = new Congregacao();
    c.nome = nome.trim();
    c.endereco = endereco;
    c.telefone = telefone;
    c.email = email;
    c.plano = plano || c.plano;
    c.website = website;
    c.cnpj = cnpj;
    c.pastor_principal = pastor_principal;
    c.limite_membros = limite_membros ?? 100;
    c.limite_storage_mb = limite_storage_mb ?? 500;
    c.limite_mensagens_mes = limite_mensagens_mes ?? 1000;
    c.ativo = ativo ?? true;
    c.data_fundacao = data_fundacao ? new Date(data_fundacao) : undefined;
    c.logo_url = logo_url;
    c.configuracoes = configuracoes;

    (c as any).created_by = (req as any).user_id;

    const saved = await repo.save(c);

    await recordAudit({
      user_id: (req as any).user_id,
      action: 'CREATE',
      resource_type: 'congregacoes',
      resource_id: saved.congregacao_id,
      new_values: saved,
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating congregacao', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// Buscar por id
router.get('/:id', authorize('congregations', 'read'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Congregacao);
    const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
    if (!c) return res.status(404).json({ message: 'Not found' });

    await recordAudit({
      user_id: (req as any).user_id,
      action: 'READ',
      resource_type: 'congregacoes',
      resource_id: c.congregacao_id,
    });

    res.json(c);
  } catch (err) {
    console.error('Error getting congregacao', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// Atualizar
router.put('/:id', authorize('congregations', 'update'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Congregacao);
    const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
    if (!c) return res.status(404).json({ message: 'Not found' });

    const old = { ...c } as any;
    const {
      nome, endereco, telefone, email, plano,
      website, cnpj, pastor_principal,
      limite_membros, limite_storage_mb, limite_mensagens_mes,
      ativo, data_fundacao, logo_url, configuracoes
    } = req.body;
    if (nome) c.nome = nome.trim();
    if (endereco !== undefined) c.endereco = endereco;
    if (telefone !== undefined) c.telefone = telefone;
    if (email !== undefined) c.email = email;
    if (plano !== undefined) c.plano = plano;
    if (website !== undefined) c.website = website;
    if (cnpj !== undefined) c.cnpj = cnpj;
    if (pastor_principal !== undefined) c.pastor_principal = pastor_principal;
    if (limite_membros !== undefined) c.limite_membros = limite_membros;
    if (limite_storage_mb !== undefined) c.limite_storage_mb = limite_storage_mb;
    if (limite_mensagens_mes !== undefined) c.limite_mensagens_mes = limite_mensagens_mes;
    if (ativo !== undefined) c.ativo = ativo;
    if (data_fundacao !== undefined) c.data_fundacao = data_fundacao ? new Date(data_fundacao) : undefined;
    if (logo_url !== undefined) c.logo_url = logo_url;
    if (configuracoes !== undefined) c.configuracoes = configuracoes;

    const updated = await repo.save(c);

    await recordAudit({
      user_id: (req as any).user_id,
      action: 'UPDATE',
      resource_type: 'congregacoes',
      resource_id: updated.congregacao_id,
      old_values: old,
      new_values: updated,
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating congregacao', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// Deletar
router.delete('/:id', authorize('congregations', 'delete'), async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Congregacao);
    const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
    if (!c) return res.status(404).json({ message: 'Not found' });

    await repo.remove(c);

    await recordAudit({
      user_id: (req as any).user_id,
      action: 'DELETE',
      resource_type: 'congregacoes',
      resource_id: c.congregacao_id,
      old_values: c,
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting congregacao', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

export default router;
