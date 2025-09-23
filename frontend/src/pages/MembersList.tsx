import React, { useEffect, useState } from 'react';
import { fetchMembers, Member, deleteMember } from '../services/membersService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface MembersListProps {
  initialMembers?: Member[];
}

const MembersList: React.FC<MembersListProps> = ({ initialMembers }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers || []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    // if initialMembers provided (test), don't fetch
    if (initialMembers) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchMembers()
      .then((data) => setMembers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [initialMembers]);

  // derived list after search
  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.nome || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.telefone || '').toLowerCase().includes(q)
    );
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Confirma exclusão do membro?')) return;
    try {
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.membro_id !== id));
      toast.success('Membro excluído');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao deletar');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Membros</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate('/dashboard')}>Voltar</button>
        <button style={{ marginLeft: 8 }} onClick={() => navigate('/members/new')}>Novo membro</button>
        <input
          placeholder="Buscar por nome, email ou telefone"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ marginLeft: 12, padding: '6px 8px', width: 300 }}
        />
        <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ marginLeft: 8 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Nome</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Email</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Telefone</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum membro encontrado</td>
              </tr>
            )}
            {paged.map((m) => (
              <tr key={m.membro_id}>
                <td style={{ padding: '8px 0' }}>{m.nome}</td>
                <td>{m.email || '-'}</td>
                <td>{m.telefone || '-'}</td>
                <td>
                  <button onClick={() => navigate(`/members/${m.membro_id}/edit`)}>Editar</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDelete(m.membro_id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Mostrando {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}</span>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Anterior</button>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próximo</button>
        <span>Página {page} / {totalPages}</span>
      </div>
    </div>
  );
};

export default MembersList;
