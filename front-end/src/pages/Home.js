import { Link } from 'react-router';
import './Home.css';

export default function Home() {
  return (
    <div className="page home-page">
      <header className="page-header">
        <h1>FindThem</h1>
        <p className="home-intro">
          Case file system for missing persons. Register a case, file a sighting report,
          or review cross-reference matches from the archive.
        </p>
      </header>
      <div className="home-actions">
        <Link to="/register" className="home-card">
          <span className="home-card-label">Case file</span>
          <span className="home-card-title">Register missing person</span>
          <span className="home-card-desc">Add photo and details to the registry</span>
        </Link>
        <Link to="/sighting" className="home-card">
          <span className="home-card-label">Report</span>
          <span className="home-card-title">File a sighting</span>
          <span className="home-card-desc">Submit an image for cross-reference</span>
        </Link>
        <Link to="/matches" className="home-card">
          <span className="home-card-label">Archive</span>
          <span className="home-card-title">Review matches</span>
          <span className="home-card-desc">Possible matches and similarity scores</span>
        </Link>
      </div>
    </div>
  );
}
