import MatchCard from '../components/MatchCard';
import './Page.css';
import './Matches.css';

// Mock data for UI demo. Replace with API fetch later.
const MOCK_MATCHES = [
  {
    id: '1',
    missingPerson: {
      id: 'mp1',
      name: 'Maria Silva',
      photoUrl: null,
    },
    sighting: {
      id: 's1',
      imageUrl: null,
      uploadedAt: '2025-03-05T14:00:00Z',
    },
    similarityScore: 87,
  },
  {
    id: '2',
    missingPerson: {
      id: 'mp2',
      name: 'João Santos',
      photoUrl: null,
    },
    sighting: {
      id: 's2',
      imageUrl: null,
      uploadedAt: '2025-03-04T09:30:00Z',
    },
    similarityScore: 62,
  },
  {
    id: '3',
    missingPerson: {
      id: 'mp3',
      name: 'Ana Costa',
      photoUrl: null,
    },
    sighting: {
      id: 's3',
      imageUrl: null,
      uploadedAt: '2025-03-03T18:00:00Z',
    },
    similarityScore: 41,
  },
];

export default function Matches() {
  const matches = MOCK_MATCHES;

  return (
    <div className="page matches-page">
      <header className="page-header">
        <span className="page-label">Archive</span>
        <h1>Cross-reference matches</h1>
        <p className="page-intro">
          Sightings matched to registry entries. Higher score indicates stronger facial similarity.
        </p>
      </header>

      {matches.length === 0 ? (
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
