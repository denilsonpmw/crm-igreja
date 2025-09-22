import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { UserSession } from '../entities/UserSession';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

function signAccessToken(userId: string) {
  return jwt.sign({ user_id: userId }, process.env.JWT_SECRET || 'dev', { expiresIn: '1h' });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body as { nome: string; email: string; senha: string };
  if (!email || !senha || !nome) return res.status(400).json({ message: 'Missing fields' });

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(senha, 10);
  const user = userRepo.create({ nome, email, senha_hash: hash });
  await userRepo.save(user);
  return res.status(201).json({ id: user.usuario_id, nome: user.nome, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body as { email: string; senha: string };
  if (!email || !senha) return res.status(400).json({ message: 'Missing fields' });

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(senha, user.senha_hash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken(user.usuario_id);
  const refreshToken = generateRefreshToken();
  const refreshHash = hashToken(refreshToken);

  const sessionRepo = AppDataSource.getRepository(UserSession);
  const session = sessionRepo.create({ user_id: user.usuario_id, refresh_token_hash: refreshHash, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
  await sessionRepo.save(session);

  return res.json({ accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });

  const refreshHash = hashToken(refreshToken);
  const sessionRepo = AppDataSource.getRepository(UserSession);
  const session = await sessionRepo.findOne({ where: { refresh_token_hash: refreshHash } });
  if (!session || session.revoked || session.expires_at < new Date()) return res.status(401).json({ message: 'Invalid refresh token' });

  const accessToken = signAccessToken(session.user_id);
  // rotate refresh token
  const newRefresh = generateRefreshToken();
  session.refresh_token_hash = hashToken(newRefresh);
  session.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await sessionRepo.save(session);

  return res.json({ accessToken, refreshToken: newRefresh });
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });

  const refreshHash = hashToken(refreshToken);
  const sessionRepo = AppDataSource.getRepository(UserSession);
  const session = await sessionRepo.findOne({ where: { refresh_token_hash: refreshHash } });
  if (!session) return res.status(200).json({});
  session.revoked = true;
  await sessionRepo.save(session);
  return res.status(200).json({});
});

export default router;
