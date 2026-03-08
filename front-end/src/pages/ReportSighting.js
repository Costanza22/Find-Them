import SightingUpload from '../components/SightingUpload';
import './Page.css';

export default function ReportSighting() {
  const handleSubmit = (payload) => {
    // TODO: POST to API when backend exists
    console.log('Report sighting:', payload);
  };

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-label">Report</span>
        <h1>File a sighting</h1>
        <p className="page-intro">
          Submit an image for comparison against the missing-persons registry.
        </p>
      </header>
      <SightingUpload onSubmit={handleSubmit} />
    </div>
  );
}
