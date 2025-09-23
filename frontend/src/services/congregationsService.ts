import api from './api';

export interface Congregacao {
  congregacao_id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export async function fetchCongregations() {
  const res = await api.get('/congregations');
  return res.data;
}

export async function getCongregation(id: string) {
  const res = await api.get(`/congregations/${id}`);
  return res.data;
}

export async function updateCongregation(id: string, payload: Partial<Congregacao>) {
  const res = await api.put(`/congregations/${id}`, payload);
  return res.data;
}
