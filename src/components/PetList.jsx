import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { getPetImage } from '../utils/petImages';

function PetList() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    ApiService.getAllPets(statusFilter || undefined)
      .then((data) => {
        setPets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load pets');
        setLoading(false);
      });
  }, [statusFilter]);

  if (loading) {
    return <div className="loading-state"><p>Loading pets...</p></div>;
  }

  if (error) {
    return <div className="error-state"><p role="alert">Error: {error}</p></div>;
  }

  if (pets.length === 0) {
    return (
      <div className="empty-state">
        <p>No pets available</p>
        <Link to="/pets/new" className="btn btn-primary">Add Your First Pet</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="page-title">Available Pets</h2>
      <div className="filter-bar">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="adopted">Adopted</option>
        </select>
      </div>
      <div className="pet-grid">
        {pets.map((pet) => (
          <Link to={`/pets/${pet.petId}`} key={pet.petId} className="pet-card">
            <img src={getPetImage(pet.species, pet.breed)} alt={pet.name} className="pet-card-img" />
            <div className="pet-card-body">
              <div className="pet-card-header">
                <h3 className="pet-card-name">{pet.name}</h3>
                <span className="pet-card-price">₹{pet.price}</span>
              </div>
              <span className={`status-badge status-${pet.status || 'available'}`}>
                {pet.status || 'available'}
              </span>
              <span className="pet-card-species">{pet.species}</span>
              <div className="pet-card-details">
                {pet.breed && <span>Breed: {pet.breed}</span>}
                {pet.age !== undefined && <span>Age: {pet.age}y</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PetList;
