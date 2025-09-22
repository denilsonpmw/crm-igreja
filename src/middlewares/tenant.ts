import { Request, Response, NextFunction } from 'express';

const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Espera um header x-congregacao-id para simplicidade
  const id = req.header('x-congregacao-id');
  if (!id) {
    req.congregacao_id = null;
    return next();
  }

  // validação mínima de UUID
  if (!uuidV4Regex.test(id)) {
    return res.status(400).json({ message: 'Invalid congregacao id format' });
  }

  req.congregacao_id = id;
  next();
}
