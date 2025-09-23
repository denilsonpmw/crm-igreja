import React, { useEffect, useState } from 'react';
import auditService from '../services/auditService';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ resource_type: '', user_id: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await auditService.fetchAuditLogs();
      setLogs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auditService.fetchAuditLogs(filter as any);
      setLogs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Audit Logs</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: 12 }}>
        <input
          placeholder="resource_type"
          value={filter.resource_type}
          onChange={(e) => setFilter({ ...filter, resource_type: e.target.value })}
        />
        <input
          placeholder="user_id"
          value={filter.user_id}
          onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
        />
        <button type="submit">Filtrar</button>
        <button type="button" onClick={() => { setFilter({ resource_type: '', user_id: '' }); load(); }}>Limpar</button>
      </form>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>created_at</th>
                <th>user</th>
                <th>action</th>
                <th>resource</th>
                <th>details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id}>
                  <td>{l.created_at}</td>
                  <td>{l.user_id}</td>
                  <td>{l.action}</td>
                  <td>{l.resource_type}</td>
                  <td><pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(l.new_values || l.old_values || {}, null, 2)}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
