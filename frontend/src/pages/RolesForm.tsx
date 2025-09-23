import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRole, updateRole, fetchRoles } from '../services/rolesService';
import { toast } from 'react-toastify';

const RolesForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchRoles().then((roles) => {
        const r = roles.find((x: any) => x.id === id);
        if (r) {
          setName(r.name || '');
          setPermissions(JSON.stringify(r.permissions || []));
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const perms = JSON.parse(permissions || '[]');
      if (id) {
        await updateRole(id, { name, permissions: perms });
        toast.success('Role atualizada');
      } else {
        await createRole({ name, permissions: perms });
        toast.success('Role criada');
      }
      navigate('/roles');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{id ? 'Editar Role' : 'Nova Role'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Nome</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Permissions (JSON)</label>
          <br />
          <textarea value={permissions} onChange={(e) => setPermissions(e.target.value)} rows={6} cols={60} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/roles')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default RolesForm;
