import './MatchCard.css';

function scoreTier(score) {
  if (score >= 80) return { label: 'High', className: 'score-high' };
  if (score >= 50) return { label: 'Medium', className: 'score-medium' };
  return { label: 'Low', className: 'score-low' };
}

export default function MatchCard({ match }) {
  const { missingPerson, sighting, similarityScore } = match;
  const tier = scoreTier(similarityScore);

  return (
    <article className="match-card">
      <div className="match-card-images">
        <div className="match-card-image-block">
          <span className="match-card-label">Missing person</span>
          {missingPerson.photoUrl ? (
            <img src={missingPerson.photoUrl} alt={missingPerson.name} />
          ) : (
            <div className="match-card-placeholder">No photo</div>
          )}
          <span className="match-card-name">{missingPerson.name}</span>
        </div>
        <div className="match-card-vs">↔</div>
        <div className="match-card-image-block">
          <span className="match-card-label">Sighting</span>
          {sighting.imageUrl ? (
            <img src={sighting.imageUrl} alt="Sighting" />
          ) : (
            <div className="match-card-placeholder">No image</div>
          )}
          <span className="match-card-meta">
            {sighting.uploadedAt ? new Date(sighting.uploadedAt).toLocaleDateString() : '—'}
          </span>
        </div>
      </div>
      <div className="match-card-score-wrap">
        <span className={`match-card-score ${tier.className}`}>
          {similarityScore}%
        </span>
        <span className={`match-card-tier ${tier.className}`}>{tier.label} match</span>
      </div>
    </article>
  );
}
