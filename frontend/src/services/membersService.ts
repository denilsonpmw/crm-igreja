import api from './api';

export interface Member {
  membro_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  created_at?: string;
}

export async function fetchMembers(page = 1, perPage = 20) {
  const res = await api.get(`/members?page=${page}&perPage=${perPage}`);
  return res.data;
}

export async function createMember(payload: Partial<Member>) {
  const res = await api.post('/members', payload);
  return res.data;
}

export async function deleteMember(id: string) {
  const res = await api.delete(`/members/${id}`);
  return res.data;
}

export async function getMember(id: string) {
  const res = await api.get(`/members/${id}`);
  return res.data;
}

export async function updateMember(id: string, payload: Partial<Member>) {
  const res = await api.put(`/members/${id}`, payload);
  return res.data;
}
