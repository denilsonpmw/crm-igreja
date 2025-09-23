import React, { useEffect, useState } from 'react';
import { fetchRoles, deleteRole } from '../services/rolesService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchRoles()
      .then((data) => setRoles(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir role?')) return;
    try {
      await deleteRole(id);
      setRoles((p) => p.filter((r) => r.id !== id));
      toast.success('Role excluída');
    } catch (err) {
      console.error(err);
      toast.error('Falha ao excluir role');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Roles</h2>
      <button onClick={() => navigate('/dashboard')}>Voltar</button>
      <button style={{ marginLeft: 8 }} onClick={() => navigate('/roles/new')}>Nova role</button>
      {loading ? <p>Carregando...</p> : (
        <ul>
          {roles.map((r) => (
            <li key={r.id} style={{ marginBottom: 8 }}>
              <strong>{r.name}</strong>
              <button style={{ marginLeft: 8 }} onClick={() => navigate(`/roles/${r.id}/edit`)}>Editar</button>
              <button style={{ marginLeft: 8 }} onClick={() => handleDelete(r.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RolesList;
