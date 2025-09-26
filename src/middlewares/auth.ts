import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token JWT ausente' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const secret = process.env.JWT_SECRET || 'dev';
    const payload = jwt.verify(token, secret) as any;
    
  // Log sucinto: registrar apenas presença do payload em nível info
  // eslint-disable-next-line no-console
  // Mantemos logs mínimos; uso de logger.main não foi criado, então usamos console via logger quando necessário
  // Não expor payload completo em produção
  // eslint-disable-next-line no-console
  // console.debug(`[AUTH MIDDLEWARE] JWT decoded for user ${payload.user_id}`);
    
  // Persistir valores em res.locals para evitar que outros middlewares sobrescrevam
  res.locals.user_id = payload.user_id;
  res.locals.congregacao_id = payload.congregacao_id;
  // Também persistir roles e permissions quando presentes no JWT para uso em authorize
  res.locals.roles = payload.roles || [];
  res.locals.permissions = payload.permissions || [];
    // também manter em req para compatibilidade, mas priorizamos res.locals nas rotas
  (req as any).user_id = payload.user_id;
  (req as any).congregacao_id = payload.congregacao_id;
  // para compatibilidade, manter roles/permissions em req também
  (req as any).roles = payload.roles || [];
  (req as any).permissions = payload.permissions || [];

  // Log de nível informação sobre o sucesso da extração (sem detalhes sensíveis)
  // eslint-disable-next-line no-console
  // console.info(`[AUTH MIDDLEWARE] Auth extracted for user ${res.locals.user_id}`);

    next();
  } catch (err) {
    console.log('[AUTH MIDDLEWARE] JWT verification failed:', err);
    return res.status(401).json({ message: 'Token JWT inválido' });
  }
}