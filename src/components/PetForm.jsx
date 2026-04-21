import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ApiService from '../services/ApiService';

function PetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    name: '', species: '', breed: '', age: '', price: '', description: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPet, setLoadingPet] = useState(false);

  useEffect(() => {
    if (id) {
      setLoadingPet(true);
      ApiService.getPetById(id)
        .then((data) => {
          setFormData({
            name: data.name || '',
            species: data.species || '',
            breed: data.breed || '',
            age: data.age !== undefined ? String(data.age) : '',
            price: data.price !== undefined ? String(data.price) : '',
            description: data.description || '',
          });
          setLoadingPet(false);
        })
        .catch((err) => {
          setApiError(err.response?.data?.error || err.message || 'Failed to load pet');
          setLoadingPet(false);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.species.trim()) newErrors.species = 'Species is required';
    if (!formData.price.toString().trim()) newErrors.price = 'Price is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const petData = { name: formData.name.trim(), species: formData.species.trim() };
    if (formData.breed.trim()) petData.breed = formData.breed.trim();
    if (formData.age !== '') petData.age = Number(formData.age);
    petData.price = Number(formData.price);
    if (formData.description.trim()) petData.description = formData.description.trim();

    setSubmitting(true);
    try {
      if (isEditMode) {
        await ApiService.updatePet(id, petData);
        navigate(`/pets/${id}`);
      } else {
        await ApiService.createPet(petData);
        navigate('/');
      }
    } catch (err) {
      const message = (err.response?.data?.error) || err.message || (isEditMode ? 'Failed to update pet' : 'Failed to create pet');
      setApiError(message);
      setSubmitting(false);
    }
  };

  if (loadingPet) {
    return <div className="loading-state"><p>Loading pet data...</p></div>;
  }

  return (
    <div className="form-container">
      <h2 className="page-title">{isEditMode ? 'Edit Pet' : 'Add New Pet'}</h2>
      {apiError && <div className="form-error" role="alert">{apiError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange}
              className={errors.name ? 'has-error' : ''} placeholder="e.g. Buddy" />
            {errors.name && <span className="field-error" role="alert">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="species">Species *</label>
            <input id="species" name="species" value={formData.species} onChange={handleChange}
              className={errors.species ? 'has-error' : ''} placeholder="e.g. Dog" />
            {errors.species && <span className="field-error" role="alert">{errors.species}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="breed">Breed</label>
            <input id="breed" name="breed" value={formData.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input id="age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Years" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="price">Price (₹) *</label>
          <input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange}
            className={errors.price ? 'has-error' : ''} placeholder="0" />
          {errors.price && <span className="field-error" role="alert">{errors.price}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange}
            placeholder="Tell us about this pet..." />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {isEditMode ? (submitting ? 'Updating...' : 'Update Pet') : (submitting ? 'Adding...' : 'Add Pet')}
          </button>
          <Link to="/" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default PetForm;
