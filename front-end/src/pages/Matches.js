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
    <div className="page">
      <h1>Possible matches</h1>
      <p className="page-intro">
        Sightings compared with registered missing persons. Higher scores indicate stronger similarity.
      </p>

      {matches.length === 0 ? (
        <div className="matches-empty">
          <p>No matches yet.</p>
          <p className="matches-empty-hint">
            Register missing persons and report sightings to see possible matches here.
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
