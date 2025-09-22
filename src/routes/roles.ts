import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/Role';
import { User } from '../entities/User';

const router = Router();

router.post('/roles', async (req, res) => {
  const { name, permissions } = req.body as any;
  if (!name) return res.status(400).json({ message: 'Missing name' });
  const repo = AppDataSource.getRepository(Role);
  const existing = await repo.findOne({ where: { name } as any });
  if (existing) return res.status(409).json({ message: 'Role exists' });
  const r = repo.create({ name, permissions: permissions || [] });
  await repo.save(r);
  res.status(201).json(r);
});

router.post('/users/:id/roles', async (req, res) => {
  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);
  const u = await userRepo.findOne({ where: { usuario_id: req.params.id } as any });
  if (!u) return res.status(404).json({ message: 'User not found' });
  const { role } = req.body as any;
  if (!role) return res.status(400).json({ message: 'Missing role' });
  const r = await roleRepo.findOne({ where: { name: role } as any });
  if (!r) return res.status(404).json({ message: 'Role not found' });
  const roles = u.roles || [];
  if (!roles.includes(r.name)) roles.push(r.name);
  u.roles = roles;
  await userRepo.save(u);
  res.json(u);
});

router.delete('/users/:id/roles', async (req, res) => {
  const userRepo = AppDataSource.getRepository(User);
  const u = await userRepo.findOne({ where: { usuario_id: req.params.id } as any });
  if (!u) return res.status(404).json({ message: 'User not found' });
  const { role } = req.body as any;
  if (!role) return res.status(400).json({ message: 'Missing role' });
  u.roles = (u.roles || []).filter((r: string) => r !== role);
  await userRepo.save(u);
  res.status(204).send();
});

router.get('/roles', async (_req, res) => {
  const repo = AppDataSource.getRepository(Role);
  const list = await repo.find();
  res.json(list);
});

router.put('/roles/:id', async (req, res) => {
  const repo = AppDataSource.getRepository(Role);
  const r = await repo.findOne({ where: { role_id: req.params.id } as any });
  if (!r) return res.status(404).json({ message: 'Role not found' });
  repo.merge(r, req.body);
  await repo.save(r);
  res.json(r);
});

router.delete('/roles/:id', async (req, res) => {
  const repo = AppDataSource.getRepository(Role);
  await repo.delete({ role_id: req.params.id } as any);
  res.status(204).send();
});

export default router;
