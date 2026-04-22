import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./components/PetList', () => ({
  default: () => <div data-testid="pet-list">PetList</div>,
}));
vi.mock('./components/PetDetail', () => ({
  default: () => <div data-testid="pet-detail">PetDetail</div>,
}));
vi.mock('./components/PetForm', () => ({
  default: () => <div data-testid="pet-form">PetForm</div>,
}));

describe('App', () => {
  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /add pet/i })).toHaveAttribute('href', '/pets/new');
  });

  it('renders PetList at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('pet-list')).toBeInTheDocument();
  });

  it('renders PetForm at /pets/new', () => {
    render(
      <MemoryRouter initialEntries={['/pets/new']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('pet-form')).toBeInTheDocument();
  });

  it('renders PetForm at /pets/:id/edit', () => {
    render(
      <MemoryRouter initialEntries={['/pets/123/edit']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('pet-form')).toBeInTheDocument();
  });

  it('renders PetDetail at /pets/:id', () => {
    render(
      <MemoryRouter initialEntries={['/pets/123']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('pet-detail')).toBeInTheDocument();
  });
});
