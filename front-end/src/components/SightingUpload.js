import { useState } from 'react';
import './SightingUpload.css';

export default function SightingUpload({ onSubmit, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file?.type?.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageFile) return;
    const payload = {
      imageFile,
      notes: notes.trim() || undefined,
      location: location.trim() || undefined,
    };
    onSubmit?.(payload);
    setSubmitted(true);
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview(null);
    setNotes('');
    setLocation('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="form-success">
        <p>Report filed. Image submitted for cross-reference.</p>
        <button type="button" onClick={resetForm} className="btn btn-secondary">
          File another report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="sighting-upload-form">
      <div className="form-group">
        <label>Sighting image *</label>
        <div
          className={`drop-zone ${imagePreview ? 'has-image' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="sighting-image"
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Sighting preview" className="sighting-preview" />
          ) : (
            <span className="drop-zone-text">Drag and drop an image here, or click to choose</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="When/where you saw this person, any details..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location (optional)</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, address, or landmark"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!imageFile}>
          Submit sighting
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
