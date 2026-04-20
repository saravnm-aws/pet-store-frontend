import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PetForm from './PetForm';
import ApiService from '../services/ApiService';

vi.mock('../services/ApiService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPetForm() {
  return render(
    <MemoryRouter>
      <PetForm />
    </MemoryRouter>
  );
}

describe('PetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields with labels', () => {
    renderPetForm();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Species/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Breed/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Age/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Pet' })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    renderPetForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Species is required')).toBeInTheDocument();
      expect(screen.getByText('Price is required')).toBeInTheDocument();
    });

    expect(ApiService.createPet).not.toHaveBeenCalled();
  });

  it('clears field error when user types in that field', async () => {
    renderPetForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy' } });
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('calls ApiService.createPet and navigates to / on valid submit', async () => {
    ApiService.createPet.mockResolvedValue({ petId: 'new-1', name: 'Buddy' });
    renderPetForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy' } });
    fireEvent.change(screen.getByLabelText(/Species/), { target: { value: 'Dog' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '299.99' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(ApiService.createPet).toHaveBeenCalledWith({
        name: 'Buddy',
        species: 'Dog',
        price: 299.99,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('sends optional fields when provided', async () => {
    ApiService.createPet.mockResolvedValue({ petId: 'new-2' });
    renderPetForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Whiskers' } });
    fireEvent.change(screen.getByLabelText(/Species/), { target: { value: 'Cat' } });
    fireEvent.change(screen.getByLabelText(/Breed/), { target: { value: 'Siamese' } });
    fireEvent.change(screen.getByLabelText(/Age/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '149.99' } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'A cute cat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(ApiService.createPet).toHaveBeenCalledWith({
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Siamese',
        age: 2,
        price: 149.99,
        description: 'A cute cat',
      });
    });
  });

  it('displays API error message on submission failure', async () => {
    ApiService.createPet.mockRejectedValue({
      response: { data: { error: 'Missing required fields: name' } },
    });
    renderPetForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy' } });
    fireEvent.change(screen.getByLabelText(/Species/), { target: { value: 'Dog' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(screen.getByText('Missing required fields: name')).toBeInTheDocument();
    });
  });

  it('displays generic error when API fails without response data', async () => {
    ApiService.createPet.mockRejectedValue(new Error('Network error'));
    renderPetForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy' } });
    fireEvent.change(screen.getByLabelText(/Species/), { target: { value: 'Dog' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    ApiService.createPet.mockReturnValue(new Promise(() => {}));
    renderPetForm();

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy' } });
    fireEvent.change(screen.getByLabelText(/Species/), { target: { value: 'Dog' } });
    fireEvent.change(screen.getByLabelText(/Price/), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Pet' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Adding...' })).toBeDisabled();
    });
  });
});

describe('PetForm (edit mode)', () => {
  const samplePet = {
    petId: 'test-id',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    price: 299.99,
    description: 'A friendly dog',
  };

  function renderPetFormEdit(id = 'test-id') {
    return render(
      <MemoryRouter initialEntries={[`/pets/${id}/edit`]}>
        <Routes>
          <Route path="/pets/:id/edit" element={<PetForm />} />
        </Routes>
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while fetching pet data', () => {
    ApiService.getPetById.mockReturnValue(new Promise(() => {}));
    renderPetFormEdit();
    expect(screen.getByText('Loading pet data...')).toBeInTheDocument();
  });

  it('pre-populates form with existing pet data', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetFormEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/).value).toBe('Buddy');
    });

    expect(screen.getByLabelText(/Species/).value).toBe('Dog');
    expect(screen.getByLabelText(/Breed/).value).toBe('Golden Retriever');
    expect(screen.getByLabelText(/Age/).value).toBe('3');
    expect(screen.getByLabelText(/Price/).value).toBe('299.99');
    expect(screen.getByLabelText(/Description/).value).toBe('A friendly dog');
  });

  it("shows 'Edit Pet' title", async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetFormEdit();

    await waitFor(() => {
      expect(screen.getByText('Edit Pet')).toBeInTheDocument();
    });
  });

  it("submit button says 'Update Pet'", async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetFormEdit();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Update Pet' })).toBeInTheDocument();
    });
  });

  it('calls updatePet on submit and navigates to pet detail page', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    ApiService.updatePet.mockResolvedValue({ ...samplePet, name: 'Buddy Updated' });
    renderPetFormEdit();

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/).value).toBe('Buddy');
    });

    fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'Buddy Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Pet' }));

    await waitFor(() => {
      expect(ApiService.updatePet).toHaveBeenCalledWith('test-id', {
        name: 'Buddy Updated',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 3,
        price: 299.99,
        description: 'A friendly dog',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/pets/test-id');
    });
  });

  it('shows error when loading pet data fails', async () => {
    ApiService.getPetById.mockRejectedValue(new Error('Server error'));
    renderPetFormEdit();

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
