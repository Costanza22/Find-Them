import { useState } from 'react';
import MissingPersonForm from '../components/MissingPersonForm';
import { apiFetch, apiUrl, validatePhoto } from '../api/client';
import './Page.css';

export default function RegisterPerson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    const photoError = validatePhoto(payload.photoFile, true);
    if (photoError) throw new Error(photoError);

    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.dateMissing) formData.append('date_missing', payload.dateMissing);
      if (payload.lastSeen) formData.append('last_seen', payload.lastSeen);
      if (payload.contactInfo) formData.append('contact_info', payload.contactInfo);
      formData.append('photo', payload.photoFile);

      const url = apiUrl('/api/missing-persons');
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
        <span className="page-label">Case file</span>
        <h1>Register missing person</h1>
        <p className="page-intro">
          Add photo and details to the registry for cross-reference with sighting reports.
        </p>
      </header>
      <MissingPersonForm onSubmit={handleSubmit} loading={loading} error={error} setError={setError} />
    </div>
  );
}
