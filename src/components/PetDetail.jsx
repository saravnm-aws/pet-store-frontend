import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { getPetImage } from '../utils/petImages';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    ApiService.getPetById(id)
      .then((data) => {
        setPet(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message || 'Failed to load pet');
        }
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      await ApiService.deletePet(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete pet');
    }
  };

  if (loading) {
    return <div className="loading-state"><p>Loading pet details...</p></div>;
  }

  if (notFound) {
    return (
      <div className="empty-state">
        <p>Pet not found</p>
        <Link to="/" className="btn btn-secondary">Back to list</Link>
      </div>
    );
  }

  if (error) {
    return <div className="error-state"><p role="alert">Error: {error}</p></div>;
  }

  return (
    <div className="pet-detail">
      <Link to="/" className="btn-link">← Back to list</Link>
      <img src={getPetImage(pet.species, pet.breed)} alt={pet.name} className="pet-detail-img" />
      <h2>{pet.name}</h2>
      <div className="pet-detail-price">${pet.price}</div>
      <dl className="pet-detail-info">
        <div>
          <dt>Species</dt>
          <dd>{pet.species}</dd>
        </div>
        <div>
          <dt>Breed</dt>
          <dd>{pet.breed || '—'}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{pet.age !== undefined ? `${pet.age} years` : '—'}</dd>
        </div>
      </dl>
      {pet.description && (
        <div className="pet-detail-description">{pet.description}</div>
      )}
      <div className="pet-detail-actions">
        <Link to={`/pets/${id}/edit`} className="btn btn-primary">Edit Pet</Link>
        <button onClick={handleDelete} className="btn btn-danger">Delete Pet</button>
      </div>
    </div>
  );
}

export default PetDetail;
