import fs from 'fs';
import path from 'path';
import { test, expect, request } from '@playwright/test';

// This E2E test targets the backend API directly.
// It uploads a small CSV to /import/members and then queries /audit/audit-logs

test('import members creates audit entries', async () => {
  const apiRequest = await request.newContext({ baseURL: 'http://localhost:3001' });

  // Prepare CSV file
  const csv = 'nome,email,cpf\nJohn Doe,john@example.com,12345678901\n';
  const tmpPath = path.join(__dirname, 'tmp_import.csv');
  fs.writeFileSync(tmpPath, csv);

  // Upload
  const uploadResponse = await apiRequest.post('/import/members', {
    multipart: {
      file: {
        name: 'file',
        mimeType: 'text/csv',
        buffer: Buffer.from(csv),
      }
    },
    headers: {
      // set a test session id header so audit contains it
      'x-session-id': 'e2e-session-1',
      'x-congregacao-id': 'e2e-cong-1'
    }
  });
  expect(uploadResponse.ok()).toBeTruthy();
  const data = await uploadResponse.json();
  expect(data.createdCount).toBeGreaterThan(0);

  // Now query audit logs
  const auditRes = await apiRequest.get('/audit/audit-logs');
  expect(auditRes.ok()).toBeTruthy();
  const audits = await auditRes.json();
  // find at least one audit with session_id 'e2e-session-1'
  const found = audits.find((a: any) => a.session_id === 'e2e-session-1');
  expect(found).toBeDefined();

  // cleanup
  try { fs.unlinkSync(tmpPath); } catch (e) {}
});
