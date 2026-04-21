import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PetDetail from './PetDetail';
import ApiService from '../services/ApiService';

vi.mock('../services/ApiService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPetDetail(id = 'test-id') {
  return render(
    <MemoryRouter initialEntries={[`/pets/${id}`]}>
      <Routes>
        <Route path="/pets/:id" element={<PetDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

const samplePet = {
  petId: 'test-id',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 3,
  price: 299.99,
  description: 'A friendly dog',
};

describe('PetDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    ApiService.getPetById.mockReturnValue(new Promise(() => {}));
    renderPetDetail();
    expect(screen.getByText('Loading pet details...')).toBeInTheDocument();
  });

  it('renders all pet fields', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    expect(screen.getByText('Species')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Breed')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('3 years')).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('A friendly dog')).toBeInTheDocument();
  });

  it('calls getPetById with the route param id', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetDetail('abc-123');

    await waitFor(() => {
      expect(ApiService.getPetById).toHaveBeenCalledWith('abc-123');
    });
  });

  it('shows "Pet not found" on 404 with link back to list', async () => {
    ApiService.getPetById.mockRejectedValue({ response: { status: 404 } });
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByText('Pet not found')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: 'Back to list' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('shows error state when API call fails', async () => {
    ApiService.getPetById.mockRejectedValue(new Error('Server error'));
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Server error');
    });
  });

  it('deletes pet and navigates to / on success', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    ApiService.deletePet.mockResolvedValue({});
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete Pet/ }));

    await waitFor(() => {
      expect(ApiService.deletePet).toHaveBeenCalledWith('test-id');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when delete fails', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    ApiService.deletePet.mockRejectedValue(new Error('Delete failed'));
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Delete Pet/ }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Delete failed');
    });
  });

  it('renders Edit link pointing to edit page', async () => {
    ApiService.getPetById.mockResolvedValue(samplePet);
    renderPetDetail();

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    const editLink = screen.getByRole('link', { name: /Edit Pet/ });
    expect(editLink).toHaveAttribute('href', '/pets/test-id/edit');
  });
});
