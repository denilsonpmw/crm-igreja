import express from 'express';
import { AppDataSource } from '../data-source';
import { Family } from '../entities/Family';
import { Member } from '../entities/Member';
import { authorize } from '../middlewares/authorize';
import { tenantMiddleware } from '../middlewares/tenant';
import { recordAudit } from '../services/auditService';

const router = express.Router();

// Middleware para aplicar tenant em todas as rotas
router.use(tenantMiddleware);

/**
 * @swagger
 * /api/families:
 *   get:
 *     summary: Lista todas as famílias da congregação
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authorize('families', 'read'), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = req.query.search as string;
    const congregacao_id = req.congregacao_id;

    if (!congregacao_id) {
      return res.status(400).json({ error: 'Congregação não especificada' });
    }

    const repository = AppDataSource.getRepository(Family);
    
    let query = repository.createQueryBuilder('family')
      .leftJoinAndSelect('family.membros', 'members')
      .where('family.congregacao_id = :congregacao_id', { congregacao_id })
      .orderBy('family.nome_familia', 'ASC');

    if (search) {
      query = query.andWhere('family.nome_familia ILIKE :search', { search: `%${search}%` });
    }

    const [families, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    await recordAudit({
      user_id: req.user_id,
      action: 'READ',
      resource_type: 'families',
      congregacao_id,
      new_values: {
        action: 'list_families',
        filters: { search, page, limit },
        total_found: total
      }
    });

    res.json({
      data: families,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Erro ao listar famílias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/families/{id}:
 *   get:
 *     summary: Busca uma família específica
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authorize('families', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const congregacao_id = req.congregacao_id;

    if (!congregacao_id) {
      return res.status(400).json({ error: 'Congregação não especificada' });
    }

    const repository = AppDataSource.getRepository(Family);
    
    const family = await repository.findOne({
      where: { familia_id: id, congregacao_id },
      relations: ['membros', 'congregacao']
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    await recordAudit({
      user_id: req.user_id,
      action: 'READ',
      resource_type: 'families',
      resource_id: id,
      congregacao_id
    });

    res.json(family);
  } catch (error) {
    console.error('Erro ao buscar família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Cria uma nova família
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authorize('families', 'create'), async (req, res) => {
  try {
    const {
      nome_familia,
      endereco,
      cidade,
      estado,
      cep,
      telefone_principal,
      observacoes
    } = req.body;
    
    const congregacao_id = req.congregacao_id;

    if (!congregacao_id) {
      return res.status(400).json({ error: 'Congregação não especificada' });
    }

    if (!nome_familia?.trim()) {
      return res.status(400).json({ error: 'Nome da família é obrigatório' });
    }

    const repository = AppDataSource.getRepository(Family);

    // Verificar se já existe família com mesmo nome na congregação
    const existingFamily = await repository.findOne({
      where: { nome_familia: nome_familia.trim(), congregacao_id }
    });

    if (existingFamily) {
      return res.status(400).json({ error: 'Já existe uma família com este nome nesta congregação' });
    }

    const family = new Family();
    family.congregacao_id = congregacao_id;
    family.nome_familia = nome_familia.trim();
    family.endereco = endereco;
    family.cidade = cidade;
    family.estado = estado;
    family.cep = cep;
    family.telefone_principal = telefone_principal;
    family.observacoes = observacoes;

    const savedFamily = await repository.save(family);

    await recordAudit({
      user_id: req.user_id,
      action: 'CREATE',
      resource_type: 'families',
      resource_id: savedFamily.familia_id,
      congregacao_id,
      new_values: {
        family_name: savedFamily.nome_familia
      }
    });

    res.status(201).json(savedFamily);
  } catch (error) {
    console.error('Erro ao criar família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/families/{id}:
 *   put:
 *     summary: Atualiza uma família
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authorize('families', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const congregacao_id = req.congregacao_id;

    if (!congregacao_id) {
      return res.status(400).json({ error: 'Congregação não especificada' });
    }
    
    const repository = AppDataSource.getRepository(Family);
    
    const family = await repository.findOne({
      where: { familia_id: id, congregacao_id }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    const oldData = { ...family };
    
    Object.assign(family, req.body);
    family.updated_at = new Date();

    const updatedFamily = await repository.save(family);

    await recordAudit({
      user_id: req.user_id,
      action: 'UPDATE',
      resource_type: 'families',
      resource_id: id,
      congregacao_id,
      old_values: oldData,
      new_values: updatedFamily
    });

    res.json(updatedFamily);
  } catch (error) {
    console.error('Erro ao atualizar família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /api/families/{id}:
 *   delete:
 *     summary: Exclui uma família
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authorize('families', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const congregacao_id = req.congregacao_id;

    if (!congregacao_id) {
      return res.status(400).json({ error: 'Congregação não especificada' });
    }
    
    const familyRepository = AppDataSource.getRepository(Family);
    const memberRepository = AppDataSource.getRepository(Member);
    
    const family = await familyRepository.findOne({
      where: { familia_id: id, congregacao_id }
    });

    if (!family) {
      return res.status(404).json({ error: 'Família não encontrada' });
    }

    // Verificar se há membros ativos nesta família
    const activeMembers = await memberRepository.count({
      where: { familia_id: id, status: 'ativo' }
    });

    if (activeMembers > 0) {
      return res.status(400).json({ 
        error: `Não é possível excluir família com ${activeMembers} membro(s) ativo(s). Mova os membros para outra família ou desative-os primeiro.` 
      });
    }

    await familyRepository.remove(family);

    await recordAudit({
      user_id: req.user_id,
      action: 'DELETE',
      resource_type: 'families',
      resource_id: id,
      congregacao_id,
      old_values: {
        family_name: family.nome_familia
      }
    });

    res.json({ message: 'Família excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir família:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;