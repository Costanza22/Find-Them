import { useState, useEffect } from 'react';
import MatchCard from '../components/MatchCard';
import { apiFetch } from '../api/client';
import './Page.css';
import './Matches.css';

const SORT_OPTIONS = [
  { value: 'score_desc', label: 'Maior score' },
  { value: 'score_asc', label: 'Menor score' },
  { value: 'date_desc', label: 'Mais recente' },
];

function normalizeMatch(m) {
  return {
    id: m.id,
    missingPerson: {
      id: m.missing_person_id,
      name: m.missing_person?.name ?? '—',
      photoUrl: m.missing_person?.photo_url ?? null,
    },
    sighting: {
      id: m.sighting_id,
      imageUrl: m.sighting?.image_url ?? null,
      uploadedAt: m.sighting?.uploadedAt ?? m.sighting?.created_at ?? null,
    },
    similarityScore: typeof m.similarity_score === 'number' ? Math.round(m.similarity_score * 100) : 0,
  };
}

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minScore, setMinScore] = useState('');
  const [sort, setSort] = useState('score_desc');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (minScore !== '' && !isNaN(parseFloat(minScore))) params.set('min_score', parseFloat(minScore) / 100);
    apiFetch(`/api/matches?${params}`)
      .then((data) => {
        if (cancelled) return;
        const list = (data?.matches ?? []).map(normalizeMatch);
        if (sort === 'score_desc') list.sort((a, b) => b.similarityScore - a.similarityScore);
        else if (sort === 'score_asc') list.sort((a, b) => a.similarityScore - b.similarityScore);
        else if (sort === 'date_desc') list.sort((a, b) => new Date(b.sighting?.uploadedAt || 0) - new Date(a.sighting?.uploadedAt || 0));
        setMatches(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Erro ao carregar matches.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [minScore, sort]);

  return (
    <div className="page matches-page">
      <header className="page-header">
        <span className="page-label">Archive</span>
        <h1>Cross-reference matches</h1>
        <p className="page-intro">
          Sightings matched to registry entries. Higher score indicates stronger facial similarity.
        </p>
      </header>

      <div className="matches-filters">
        <label className="matches-filter-label">
          Score mínimo (%)
          <input
            type="number"
            min="0"
            max="100"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="0"
            className="matches-filter-input"
          />
        </label>
        <label className="matches-filter-label">
          Ordenar
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="matches-filter-select">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="matches-loading">Carregando…</p>
      ) : matches.length === 0 ? (
        <div className="matches-empty">
          <p>No matches on file.</p>
          <p className="matches-empty-hint">
            Register cases and file sighting reports to generate cross-reference matches.
          </p>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
