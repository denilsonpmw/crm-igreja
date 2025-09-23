import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMember, getMember, updateMember } from '../services/membersService';
import { toast } from 'react-toastify';

const MembersForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getMember(id)
        .then((data) => {
          setNome(data.nome || '');
          setEmail(data.email || '');
          setTelefone(data.telefone || '');
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Validação simples
    if (!nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Email inválido');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await updateMember(id, { nome, email, telefone });
      } else {
        await createMember({ nome, email, telefone });
      }
  // feedback e redirecionamento
  toast.success('Membro salvo com sucesso');
  navigate('/members');
    } catch (err) {
      console.error(err);
  setError('Erro ao salvar membro');
  toast.error('Erro ao salvar membro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{id ? 'Editar membro' : 'Novo membro'}</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
        )}
        {message && (
          <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>
        )}
        <div style={{ marginBottom: 8 }}>
          <label>Nome</label>
          <br />
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Telefone</label>
          <br />
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/members')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default MembersForm;
