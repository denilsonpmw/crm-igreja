import api from './api';

export interface Permission {
  resource: string;
  action: string;
  scope: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export async function fetchRoles() {
  const res = await api.get('/roles');
  return res.data;
}

export async function createRole(payload: Partial<Role>) {
  const res = await api.post('/roles', payload);
  return res.data;
}

export async function updateRole(id: string, payload: Partial<Role>) {
  const res = await api.put(`/roles/${id}`, payload);
  return res.data;
}

export async function deleteRole(id: string) {
  const res = await api.delete(`/roles/${id}`);
  return res.data;
}
