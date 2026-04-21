import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PetList from './PetList';
import ApiService from '../services/ApiService';

vi.mock('../services/ApiService');

function renderPetList() {
  return render(
    <MemoryRouter>
      <PetList />
    </MemoryRouter>
  );
}

describe('PetList', () => {
  it('shows loading state initially', () => {
    ApiService.getAllPets.mockReturnValue(new Promise(() => {}));
    renderPetList();
    expect(screen.getByText('Loading pets...')).toBeInTheDocument();
  });

  it('renders empty-state message when API returns []', async () => {
    ApiService.getAllPets.mockResolvedValue([]);
    renderPetList();
    await waitFor(() => {
      expect(screen.getByText('No pets available')).toBeInTheDocument();
    });
  });

  it('renders pet cards with name, species, breed, age, price', async () => {
    const pets = [
      { petId: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 3, price: 299.99 },
      { petId: '2', name: 'Whiskers', species: 'Cat', breed: 'Siamese', age: 2, price: 149.99 },
    ];
    ApiService.getAllPets.mockResolvedValue(pets);
    renderPetList();

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    expect(screen.getByText('Whiskers')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText(/Breed:.*Golden Retriever/)).toBeInTheDocument();
    expect(screen.getByText(/Breed:.*Siamese/)).toBeInTheDocument();
    expect(screen.getByText(/Age:.*3y/)).toBeInTheDocument();
    expect(screen.getByText(/Age:.*2y/)).toBeInTheDocument();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();
  });

  it('renders links to /pets/:id for each pet', async () => {
    const pets = [
      { petId: 'abc-123', name: 'Polly', species: 'Bird', breed: 'Macaw', age: 5, price: 499.99 },
    ];
    ApiService.getAllPets.mockResolvedValue(pets);
    renderPetList();

    await waitFor(() => {
      expect(screen.getByText('Polly')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /Polly/ });
    expect(link).toHaveAttribute('href', '/pets/abc-123');
  });

  it('displays error state when API call fails', async () => {
    ApiService.getAllPets.mockRejectedValue(new Error('Network error'));
    renderPetList();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Network error');
    });
  });
});
