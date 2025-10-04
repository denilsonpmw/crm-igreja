import jwt from 'jsonwebtoken';

export function getTestJwt() {
  const payload = {
    user_id: '08ac05b3-7a23-4eff-b3e1-afebfd7e4c44',
    congregacao_id: null, // SEM congregação para evitar FK violation em testes
    roles: ['admin'],
    permissions: [
      { resource: 'members', action: 'create', scope: 'all' }, // scope 'all' permite criar sem congregacao_id
      { resource: 'anexos', action: 'create', scope: 'all' }
    ],
    modulosLiberados: ['members', 'anexos'],
    sessionId: 'test-session',
    plano: 'basico',
    limites: { max_members: 100, storage_mb: 500 },
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  };
  const secret = process.env.JWT_SECRET || 'dev';
  return jwt.sign(payload, secret);
}
