import { tenantMiddleware } from '../middlewares/tenant';

import { Request } from 'express';
function makeReq(header?: string): Request & { congregacao_id?: string | null } {
  return {
    headers: header ? { 'x-congregacao-id': header } : {},
    congregacao_id: null,
    header: function (name: string) {
      return this.headers[name.toLowerCase()];
    },
  } as Request & { congregacao_id?: string | null };
}

function makeRes() {
  return {
    status: (code: number) => ({ json: (obj: unknown) => ({ code, obj }) }),
  } as unknown as import('express').Response;
}

test('tenant middleware sets null when header missing', () => {
  const req = makeReq();
  const res = makeRes();
  let called = false;
  tenantMiddleware(req, res, () => { called = true; });
  expect(called).toBe(true);
  expect(req.congregacao_id).toBeNull();
});

test('tenant middleware rejects invalid uuid', () => {
  const req = makeReq('not-a-uuid');
  const res = makeRes();
  const next = jest.fn();
  const result = tenantMiddleware(req, res, next);
  // middleware returns a response object via res.status().json()
  expect(next).not.toHaveBeenCalled();
});

test('tenant middleware accepts valid uuid', () => {
  const valid = '123e4567-e89b-12d3-a456-426614174000';
  const req = makeReq(valid);
  const res = makeRes();
  let called = false;
  tenantMiddleware(req, res, () => { called = true; });
  expect(called).toBe(true);
  expect(req.congregacao_id).toBe(valid);
});
