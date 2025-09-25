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
      const userId = req.user_id as string | undefined | null;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ where: { usuario_id: userId } as unknown as Record<string, unknown> });
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const roles: string[] = user.roles || [];
      if (roles.includes('admin')) return next();

      // load Role entities for the user's roles
  const RoleEntity = require('../entities/Role').Role;
  const roleRepo = getRepository(RoleEntity);
  // find role entities and filter by name (roles contains names)
  const allRoles = await roleRepo.find().catch(() => []) as Array<{ name?: string; permissions?: unknown[] }>;
  const roleEntities = (allRoles || []).filter((r) => (roles || []).includes(r.name || ''));

      // collect permissions from role entities
      const perms: Permission[] = [];
      for (const r of roleEntities) {
        const p = (r.permissions || []) as Permission[];
        perms.push(...p);
      }

      // also support roles named like 'resource:action' or 'resource:action:scope' for backward compatibility
      for (const rname of roles) {
        const parts = rname.split(':');
        if (parts.length >= 2) {
          const scopePart = parts[2] as string | undefined;
          const scope = scopePart === 'congregation' || scopePart === 'scoped' ? 'congregation' : (scopePart === 'own' ? 'own' : 'all');
          perms.push({ resource: parts[0], action: parts[1], scope });
        }
      }

      const matches = perms.filter(p => (p.resource === resource || p.resource === '*') && (p.action === action || p.action === '*'));
      if (!matches.length) return res.status(403).json({ message: 'Forbidden' });

      // evaluate scopes: if any permission grants action with acceptable scope, allow
      for (const p of matches) {
        const scope = p.scope || 'all';
  if (scope === 'all') return next();
        if (scope === 'congregation') {
          // for create action: require req.congregacao_id
          if (action === 'create') {
            if (req.congregacao_id) return next();
            continue;
          }
          // for operations on existing resources, check resource's congregacao_id
          const id = (req.params && (req.params.id || req.params.membro_id)) as string | undefined;
          if (!id) continue;
          // map resource to entity
          if (resource === 'members') {
            const Member = require('../entities/Member').Member;
            const repo = getRepository(Member);
            const ent = await repo.findOne({ where: { membro_id: id } as unknown as Record<string, unknown> }) as unknown as { congregacao_id?: string } | null;
            if (!ent) return res.status(404).json({ message: 'Not found' });
            if (ent.congregacao_id && req.congregacao_id && ent.congregacao_id === req.congregacao_id) return next();
            continue;
          }
          // other resources could be added here
        }
        if (scope === 'own') {
          // for 'own' scope, check resource ownership by created_by or owner field
          const id = (req.params && (req.params.id || req.params.membro_id)) as string | undefined;
          if (!id) continue;
          if (resource === 'members') {
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
