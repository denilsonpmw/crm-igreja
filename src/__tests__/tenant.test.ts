import { tenantMiddleware } from '../middlewares/tenant';

function makeReq(header?: string) {
  return {
    header: (name: string) => name === 'x-congregacao-id' ? header : undefined,
  } as any;
}

function makeRes() {
  return {
    status: (code: number) => ({ json: (obj: any) => ({ code, obj }) }),
  } as any;
}

test('tenant middleware sets null when header missing', () => {
  const req: any = makeReq();
  const res = makeRes();
  let called = false;
  tenantMiddleware(req, res as any, () => { called = true; });
  expect(called).toBe(true);
  expect(req.congregacao_id).toBeNull();
});

test('tenant middleware rejects invalid uuid', () => {
  const req: any = makeReq('not-a-uuid');
  const res: any = makeRes();
  const next = jest.fn();
  const result = tenantMiddleware(req, res, next as any);
  // middleware returns a response object via res.status().json()
  expect(next).not.toHaveBeenCalled();
});

test('tenant middleware accepts valid uuid', () => {
  const valid = '123e4567-e89b-12d3-a456-426614174000';
  const req: any = makeReq(valid);
  const res = makeRes();
  let called = false;
  tenantMiddleware(req, res as any, () => { called = true; });
  expect(called).toBe(true);
  expect(req.congregacao_id).toBe(valid);
});
