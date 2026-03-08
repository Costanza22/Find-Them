import SightingUpload from '../components/SightingUpload';
import './Page.css';

export default function ReportSighting() {
  const handleSubmit = (payload) => {
    // TODO: POST to API when backend exists
    console.log('Report sighting:', payload);
  };

  return (
    <div className="page">
      <h1>Report a sighting</h1>
      <p className="page-intro">
        Upload a photo of a possible sighting. It will be compared with registered missing persons.
      </p>
      <SightingUpload onSubmit={handleSubmit} />
    </div>
  );
}
