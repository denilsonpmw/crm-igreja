import React, { useEffect, useState } from 'react';
import { fetchCongregations } from '../services/congregationsService';
import { useNavigate } from 'react-router-dom';

const CongregationsList: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchCongregations()
      .then((data) => setItems(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Congregações</h2>
      <button onClick={() => navigate('/dashboard')}>Voltar</button>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {items.map((c) => (
            <li key={c.congregacao_id} style={{ marginBottom: 8 }}>
              <strong>{c.nome}</strong> — {c.email || '-'}
              <button style={{ marginLeft: 8 }} onClick={() => navigate(`/congregations/${c.congregacao_id}/edit`)}>Editar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CongregationsList;
