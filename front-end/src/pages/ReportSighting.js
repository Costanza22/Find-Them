import { useState } from 'react';
import SightingUpload from '../components/SightingUpload';
import { apiUrl, validatePhoto } from '../api/client';
import './Page.css';

export default function ReportSighting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    const photoError = validatePhoto(payload.imageFile, true);
    if (photoError) throw new Error(photoError);

    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', payload.imageFile);
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.location) formData.append('location', payload.location);

      const url = apiUrl('/api/sightings');
      await fetch(url, {
        method: 'POST',
        body: formData,
      }).then((res) => {
        if (!res.ok) return res.json().then((j) => { throw new Error(j.error || `Erro ${res.status}`); });
        return res.json();
      });
    } finally {
      setLoading(false);
    }
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
      <SightingUpload onSubmit={handleSubmit} loading={loading} error={error} setError={setError} />
    </div>
  );
}
