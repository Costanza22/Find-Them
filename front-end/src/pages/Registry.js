import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import './Page.css';
import './Registry.css';

export default function Registry() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch('/api/missing-persons')
      .then((data) => {
        if (cancelled) return;
        setPersons(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Erro ao carregar o registro.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page registry-page">
      <header className="page-header">
        <span className="page-label">Registry</span>
        <h1>Missing persons</h1>
        <p className="page-intro">Cases registered for cross-reference with sighting reports.</p>
      </header>

      {error && (
        <div className="form-error" role="alert">{error}</div>
      )}

      {loading && <p className="registry-loading">Carregando…</p>}
      {!loading && persons.length === 0 && (
        <div className="registry-empty">
          <p>Nenhum caso no registro.</p>
          <p className="registry-empty-hint">Cadastre uma pessoa desaparecida na página Register.</p>
        </div>
      )}
      {!loading && persons.length > 0 && (
        <div className="registry-grid">
          {persons.map((p) => (
            <article key={p.id} className="registry-card">
              <div className="registry-card-photo">
                {(p.photo_url || p.photo_path) ? (
                  <img src={p.photo_url || p.photo_path} alt={p.name} />
                ) : (
                  <span className="registry-card-no-photo">Sem foto</span>
                )}
              </div>
              <div className="registry-card-body">
                <h3 className="registry-card-name">{p.name}</h3>
                {p.date_missing && (
                  <p className="registry-card-meta">Desaparecido(a) em: {new Date(p.date_missing).toLocaleDateString('pt-BR')}</p>
                )}
                {p.last_seen && (
                  <p className="registry-card-meta">Última vez visto(a): {p.last_seen}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
