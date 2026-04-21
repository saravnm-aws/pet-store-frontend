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

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedPet = await ApiService.updatePetStatus(id, newStatus);
      setPet(updatedPet);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

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
      <span className={`status-badge status-${pet.status || 'available'}`}>
        {pet.status || 'available'}
      </span>
      <div className="pet-detail-price">₹{pet.price}</div>
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
        <div>
          <dt>Status</dt>
          <dd className="pet-status-value">{pet.status || 'available'}</dd>
        </div>
      </dl>
      {pet.description && (
        <div className="pet-detail-description">{pet.description}</div>
      )}
      <div className="pet-detail-actions">
        <Link to={`/pets/${id}/edit`} className="btn btn-primary">Edit Pet</Link>
        <button onClick={handleDelete} className="btn btn-danger">Delete Pet</button>
      </div>
      <div className="pet-status-actions">
        {(pet.status === 'available' || !pet.status) && (
          <>
            <button onClick={() => handleStatusChange('pending')} className="btn btn-status-pending">
              Mark as Pending
            </button>
            <button onClick={() => handleStatusChange('adopted')} className="btn btn-status-adopted">
              Mark as Adopted
            </button>
          </>
        )}
        {pet.status === 'pending' && (
          <>
            <button onClick={() => handleStatusChange('available')} className="btn btn-status-available">
              Mark as Available
            </button>
            <button onClick={() => handleStatusChange('adopted')} className="btn btn-status-adopted">
              Mark as Adopted
            </button>
          </>
        )}
        {pet.status === 'adopted' && (
          <button onClick={() => handleStatusChange('available')} className="btn btn-status-available">
            Mark as Available
          </button>
        )}
      </div>
    </div>
  );
}

export default PetDetail;
