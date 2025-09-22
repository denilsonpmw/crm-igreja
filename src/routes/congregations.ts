import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Congregacao } from '../entities/Congregacao';

const router = Router();

router.get('/', async (req, res) => {
  const repo = AppDataSource.getRepository(Congregacao);
  const items = await repo.find();
  res.json(items);
});

router.post('/', async (req, res) => {
  const { nome, endereco, telefone, email, plano } = req.body;
  if (!nome) return res.status(400).json({ message: 'Missing nome' });
  const repo = AppDataSource.getRepository(Congregacao);
  const c = repo.create({ nome, endereco, telefone, email, plano });
  await repo.save(c);
  res.status(201).json(c);
});

router.get('/:id', async (req, res) => {
  const repo = AppDataSource.getRepository(Congregacao);
  const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

router.put('/:id', async (req, res) => {
  const repo = AppDataSource.getRepository(Congregacao);
  const c = await repo.findOne({ where: { congregacao_id: req.params.id } });
  if (!c) return res.status(404).json({ message: 'Not found' });
  repo.merge(c, req.body);
  await repo.save(c);
  res.json(c);
});

router.delete('/:id', async (req, res) => {
  const repo = AppDataSource.getRepository(Congregacao);
  await repo.delete({ congregacao_id: req.params.id } as any);
  res.status(204).send();
});

export default router;
