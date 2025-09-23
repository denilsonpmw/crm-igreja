import api from './api';

export interface AuditLogFilter {
  resource_type?: string;
  user_id?: string;
  congregacao_id?: string;
}

export async function fetchAuditLogs(filters: AuditLogFilter = {}) {
  const params = new URLSearchParams();
  if (filters.resource_type) params.append('resource_type', filters.resource_type);
  if (filters.user_id) params.append('user_id', filters.user_id);
  if (filters.congregacao_id) params.append('congregacao_id', filters.congregacao_id);
  const res = await api.get(`/audit/audit-logs?${params.toString()}`);
  return res.data;
}

export default { fetchAuditLogs };
