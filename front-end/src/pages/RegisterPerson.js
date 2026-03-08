import MissingPersonForm from '../components/MissingPersonForm';
import './Page.css';

export default function RegisterPerson() {
  const handleSubmit = (payload) => {
    // TODO: POST to API when backend exists
    console.log('Register missing person:', payload);
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
      <MissingPersonForm onSubmit={handleSubmit} />
    </div>
  );
}
