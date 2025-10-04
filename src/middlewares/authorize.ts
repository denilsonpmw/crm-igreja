import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import type { EntityTarget, Repository, DataSource, ObjectLiteral } from 'typeorm';

// helper to pick datasource: prefer AppDataSource, fall back to TestDataSource when present
function getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
  // AppDataSource may be uninitialized in tests; guard access safely
  const appDsInitialized = (AppDataSource as unknown as { isInitialized?: boolean }).isInitialized;
  if (AppDataSource && appDsInitialized) {
    return AppDataSource.getRepository<T>(entity);
  }
  try {
    // when running tests, use the TestDataSource defined in tests helpers
  const td = require('../__tests__/helpers/testDataSource').TestDataSource as DataSource;
    return td.getRepository<T>(entity);
  } catch (err) {
    // fallback to AppDataSource
    return AppDataSource.getRepository<T>(entity);
  }
}

interface Permission {
  resource: string;
  action: string;
  scope?: 'own' | 'congregation' | 'all';
}

// permission-based authorize middleware
export function authorize(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
  // logs minimalistas para auditoria em nível debug — não expor em produção
  // eslint-disable-next-line no-console
  // console.debug('[AUTHORIZE MIDDLEWARE] authorization header present');

      // Preferir valores em res.locals (mais estáveis) e cair para req quando necessário
      const userId = (res.locals && res.locals.user_id) ? String(res.locals.user_id) : (req as any).user_id as string | undefined | null;
      if (!userId) {
        // fallback case: sem userId, não autorizado
        return res.status(401).json({ message: 'Unauthorized' });
      }

  // Preferir roles/permissions vindos do JWT (res.locals) quando disponíveis — evita depender
  // de uma leitura imediata do banco que pode falhar em cenários de teste onde a sincronização
  // do DB esteja em andamento.
  const rolesFromJwtRaw: string[] = (res.locals && res.locals.roles) ? res.locals.roles : (req as any).roles || [];
  const permsFromJwt: any[] = (res.locals && res.locals.permissions) ? res.locals.permissions : (req as any).permissions || [];

  // Normalizar roles para lowercase para comparações case-insensitive
  const rolesFromJwt = (rolesFromJwtRaw || []).map(r => (typeof r === 'string' ? r.toLowerCase() : r));

  // Normalizar requested action/resource
  const requestedAction = (action || '').toString().toLowerCase();
  const requestedResource = (resource || '').toString().toLowerCase();

      // Se temos roles vindas do JWT, podemos usá-las diretamente para decisões de autorização
      if (rolesFromJwt && rolesFromJwt.includes('admin')) {
        const congIdForLog = (res.locals && res.locals.congregacao_id) ? res.locals.congregacao_id : (req as any).congregacao_id;
        // admin shortcut
        // logger.info(`Admin access granted for congregacao ${congIdForLog}`);
        return next();
      }

      // Caso roles não estejam no JWT, buscar no banco como fallback
      const userRepo = getRepository(User);
      const user = await userRepo.findOne({ where: { usuario_id: userId } as unknown as Record<string, unknown> });
      if (!user && (!rolesFromJwt || !rolesFromJwt.length)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Determinar roles a partir do JWT, ou do usuário salvo no banco
      // Normalize roles from DB as well to lowercase strings
      const rolesFromDb: string[] = (user && user.roles) ? (Array.isArray(user.roles) ? user.roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : r)) : []) : [];
      const roles: string[] = (rolesFromJwt && rolesFromJwt.length) ? rolesFromJwt : rolesFromDb;
      if (roles.includes('admin')) {
        const congIdForLog = (res.locals && res.locals.congregacao_id) ? res.locals.congregacao_id : (req as any).congregacao_id;
        // logger.info(`Admin access granted for congregacao ${congIdForLog}`);
        return next();
      }

      // load Role entities for the user's roles
  const RoleEntity = require('../entities/Role').Role;
  const roleRepo = getRepository(RoleEntity);
  // find role entities and filter by name (roles contains names)
  const allRoles = await roleRepo.find().catch(() => []) as Array<{ name?: string; permissions?: unknown[] }>;
  const roleEntities = (allRoles || []).filter((r) => {
    const name = (r.name || '').toString().toLowerCase();
    return (roles || []).includes(name);
  });

      // collect permissions from role entities
      const perms: Permission[] = [];
      for (const r of roleEntities) {
        const p = (r.permissions || []) as Permission[];
        perms.push(...p);
      }

      // also support roles named like 'resource:action' or 'resource:action:scope' for backward compatibility
      for (const rnameRaw of roles) {
        const rname = (typeof rnameRaw === 'string') ? rnameRaw : String(rnameRaw);
        const parts = rname.split(':');
        if (parts.length >= 2) {
          const resourcePart = parts[0].toLowerCase();
          const actionPart = parts[1].toLowerCase();
          const scopePart = parts[2] as string | undefined;
          const scope = scopePart === 'congregation' || scopePart === 'scoped' ? 'congregation' : (scopePart === 'own' ? 'own' : 'all');
          perms.push({ resource: resourcePart, action: actionPart, scope });
        }
      }

      // match case-insensitive using normalized requested values
      const matches = perms.filter(p => {
        const pr = (p.resource || '').toString().toLowerCase();
        const pa = (p.action || '').toString().toLowerCase();
        return (pr === requestedResource || pr === '*') && (pa === requestedAction || pa === '*');
      });
      if (!matches.length) return res.status(403).json({ message: 'Forbidden' });

      // evaluate scopes: if any permission grants action with acceptable scope, allow
      for (const p of matches) {
        const scope = (p.scope || 'all').toString().toLowerCase();
        if (scope === 'all') return next();
        if (scope === 'congregation') {
          // for create action: require req.congregacao_id
          if (requestedAction === 'create') {
            const congCheck = (res.locals && res.locals.congregacao_id) ? res.locals.congregacao_id : (req as any).congregacao_id;
            if (congCheck) return next();
            continue;
          }
          // for operations on existing resources, check resource's congregacao_id
          const id = (req.params && (req.params.id || req.params.membro_id)) as string | undefined;
          if (!id) continue;
          // map resource to entity
          if (requestedResource === 'members' || requestedResource === 'membros') {
            const Member = require('../entities/Member').Member;
            const repo = getRepository(Member);
            const ent = await repo.findOne({ where: { membro_id: id } as unknown as Record<string, unknown> }) as unknown as { congregacao_id?: string } | null;
            if (!ent) return res.status(404).json({ message: 'Not found' });
            const congCheck = (res.locals && res.locals.congregacao_id) ? res.locals.congregacao_id : (req as any).congregacao_id;
            if (ent.congregacao_id && congCheck && ent.congregacao_id === congCheck) return next();
            continue;
          }
          // other resources could be added here
        }
        if (scope === 'own') {
          // for 'own' scope, check resource ownership by created_by or owner field
          const id = (req.params && (req.params.id || req.params.membro_id)) as string | undefined;
          if (!id) continue;
          if (requestedResource === 'members' || requestedResource === 'membros') {
            const Member = require('../entities/Member').Member;
            const repo = getRepository(Member);
            const ent = await repo.findOne({ where: { membro_id: id } as unknown as Record<string, unknown> }) as unknown as { created_by?: string } | null;
            if (!ent) return res.status(404).json({ message: 'Not found' });
            if (ent.created_by && userId && ent.created_by === userId) return next();
            continue;
          }
        }
      }

      return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
      logger.error(err);
      return res.status(500).json({ message: 'Internal error' });
    }
  };
}
