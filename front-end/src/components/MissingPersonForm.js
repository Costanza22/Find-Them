import { useState } from 'react';
import './MissingPersonForm.css';

export default function MissingPersonForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [dateMissing, setDateMissing] = useState('');
  const [lastSeen, setLastSeen] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      dateMissing: dateMissing || undefined,
      lastSeen: lastSeen.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
      photoFile,
    };
    onSubmit?.(payload);
    setSubmitted(true);
  };

  const resetForm = () => {
    setName('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setDescription('');
    setDateMissing('');
    setLastSeen('');
    setContactInfo('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="form-success">
        <p>Case filed. Entry added to registry.</p>
        <button type="button" onClick={resetForm} className="btn btn-secondary">
          File another case
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="missing-person-form">
      <div className="form-group">
        <label htmlFor="name">Full name *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Full name"
        />
      </div>

      <div className="form-group">
        <label>Photo</label>
        <div className="photo-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            id="photo"
          />
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="photo-preview" />
          ) : (
            <span className="photo-placeholder">Choose a photo</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Physical description, clothing, etc."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateMissing">Date missing</label>
          <input
            id="dateMissing"
            type="date"
            value={dateMissing}
            onChange={(e) => setDateMissing(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastSeen">Last seen (location)</label>
          <input
            id="lastSeen"
            type="text"
            value={lastSeen}
            onChange={(e) => setLastSeen(e.target.value)}
            placeholder="City or place"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contactInfo">Contact info (for reports)</label>
        <input
          id="contactInfo"
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Phone or email"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
          Register
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
