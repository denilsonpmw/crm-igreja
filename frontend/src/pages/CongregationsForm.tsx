import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCongregation, updateCongregation } from '../services/congregationsService';
import { toast } from 'react-toastify';

const CongregationsForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getCongregation(id)
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
    setLoading(true);
    try {
      if (id) {
        await updateCongregation(id, { nome, email, telefone });
        toast.success('Congregação atualizada');
      }
      navigate('/congregations');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar congregação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Editar Congregação</h2>
      <form onSubmit={handleSubmit}>
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
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/congregations')}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default CongregationsForm;
