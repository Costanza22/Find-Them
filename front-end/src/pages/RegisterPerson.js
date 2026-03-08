import MissingPersonForm from '../components/MissingPersonForm';
import './Page.css';

export default function RegisterPerson() {
  const handleSubmit = (payload) => {
    // TODO: POST to API when backend exists
    console.log('Register missing person:', payload);
  };

  return (
    <div className="page">
      <h1>Register a missing person</h1>
      <p className="page-intro">
        Add a missing person to the database with a photo and details. This helps match sightings later.
      </p>
      <MissingPersonForm onSubmit={handleSubmit} />
    </div>
  );
}
