import { Link } from 'react-router';
import './Home.css';

export default function Home() {
  return (
    <div className="page home-page">
      <h1>FindThem</h1>
      <p className="home-intro">
        Help reunite missing persons with their families. Register a missing person,
        report a sighting with a photo, or review possible matches.
      </p>
      <div className="home-actions">
        <Link to="/register" className="home-card">
          <span className="home-card-icon">👤</span>
          <span className="home-card-title">Register a missing person</span>
          <span className="home-card-desc">Add photo and details to the database</span>
        </Link>
        <Link to="/sighting" className="home-card">
          <span className="home-card-icon">📷</span>
          <span className="home-card-title">Report a sighting</span>
          <span className="home-card-desc">Upload an image of a possible sighting</span>
        </Link>
        <Link to="/matches" className="home-card">
          <span className="home-card-icon">🔍</span>
          <span className="home-card-title">View matches</span>
          <span className="home-card-desc">See possible matches and similarity scores</span>
        </Link>
      </div>
    </div>
  );
}
