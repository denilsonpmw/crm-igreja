import React, { useState } from 'react';
import { toast } from 'react-toastify';
import importService from '../services/importService';

const ImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.warn('Selecione um arquivo CSV.');
    setLoading(true);
    setResult(null);
    try {
      const res = await importService.uploadMembersCsv(file, (p) => setProgress(p));
  setResult(res);
  toast.success(`Importado: ${res.createdCount}, Pulados: ${res.skippedCount}, Erros: ${res.errorsCount || 0}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Erro ao importar CSV');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container">
      <h2>Importar Membros (CSV)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" accept="text/csv" onChange={handleFile} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={!file || loading}>
            {loading ? `Enviando... ${progress}%` : 'Enviar CSV'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Resultado</h3>
          <p>Criados: {result.createdCount}</p>
          <p>Pulados: {result.skippedCount}</p>
          <p>Erros: {result.errorsCount || 0}</p>
          {result.errorsCount > 0 && (
            <div>
              <h4>Erros (amostra)</h4>
              <ul>
                {(result.errors || []).slice(0, 10).map((err: any, i: number) => (
                  <li key={i}>Linha {err.line}: {err.reason}</li>
                ))}
              </ul>
              <div style={{ marginTop: 8 }}>
                <button onClick={() => {
                  const rows = (result.errors || []).map((e: any) => ({ line: e.line, reason: e.reason, raw: JSON.stringify(e.raw) }));
                  const header = 'line,reason,raw\n';
                  const csv = header + rows.map((r: any) => `${r.line},"${r.reason}","${r.raw.replace(/"/g, '""')}"`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'import_errors.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}>Baixar CSV de erros</button>
              </div>
            </div>
          )}
          <details>
            <summary>Ver detalhes</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
