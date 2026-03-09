import './Skeleton.css';

export function SkeletonRegistryCard() {
  return (
    <div className="skeleton-registry-card">
      <div className="skeleton skeleton-registry-photo" />
      <div className="skeleton-registry-body">
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="skeleton skeleton-text xs" />
      </div>
    </div>
  );
}

export function SkeletonMatchCard() {
  return (
    <div className="skeleton-match-card">
      <div className="skeleton-match-images">
        <div className="skeleton skeleton-match-thumb" />
        <div className="skeleton skeleton-match-vs" />
        <div className="skeleton skeleton-match-thumb" />
      </div>
      <div className="skeleton skeleton-match-score skeleton" />
    </div>
  );
}

export function SkeletonRegistryGrid({ count = 6 }) {
  return (
    <div className="registry-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonRegistryCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonMatchList({ count = 3 }) {
  return (
    <div className="matches-list">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonMatchCard key={i} />
      ))}
    </div>
  );
}
