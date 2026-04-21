// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('ApiService', () => {
  let ApiService;
  let mockAxiosInstance;

  beforeEach(async () => {
    vi.resetModules();

    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    axios.create.mockReturnValue(mockAxiosInstance);

    const mod = await import('./ApiService.js');
    ApiService = mod.default;
  });

  it('reads base URL from VITE_API_BASE_URL environment variable', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining('/api'),
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  describe('getAllPets', () => {
    it('calls GET /pets and returns data', async () => {
      const pets = [{ petId: '1', name: 'Buddy', species: 'Dog', price: 100 }];
      mockAxiosInstance.get.mockResolvedValue({ data: pets });

      const result = await ApiService.getAllPets();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pets', { params: {} });
      expect(result).toEqual(pets);
    });

    it('propagates errors from the API', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network Error'));

      await expect(ApiService.getAllPets()).rejects.toThrow('Network Error');
    });

    it('passes status as query parameter when provided', async () => {
      const pets = [{ petId: '1', name: 'Buddy', status: 'available' }];
      mockAxiosInstance.get.mockResolvedValue({ data: pets });

      const result = await ApiService.getAllPets('available');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pets', { params: { status: 'available' } });
      expect(result).toEqual(pets);
    });
  });

  describe('getPetById', () => {
    it('calls GET /pets/:id and returns data', async () => {
      const pet = { petId: 'abc', name: 'Whiskers', species: 'Cat', price: 50 };
      mockAxiosInstance.get.mockResolvedValue({ data: pet });

      const result = await ApiService.getPetById('abc');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pets/abc');
      expect(result).toEqual(pet);
    });

    it('propagates 404 errors', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404, data: { error: 'Pet not found' } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(ApiService.getPetById('nonexistent')).rejects.toThrow('Not Found');
    });
  });

  describe('createPet', () => {
    it('calls POST /pets with data and returns created pet', async () => {
      const petData = { name: 'Polly', species: 'Bird', price: 200 };
      const created = { petId: 'xyz', ...petData };
      mockAxiosInstance.post.mockResolvedValue({ data: created });

      const result = await ApiService.createPet(petData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/pets', petData);
      expect(result).toEqual(created);
    });

    it('propagates validation errors', async () => {
      const error = new Error('Bad Request');
      error.response = { status: 400, data: { error: 'Missing required fields: name' } };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(ApiService.createPet({})).rejects.toThrow('Bad Request');
    });
  });

  describe('updatePet', () => {
    it('calls PUT /pets/:id with data and returns updated pet', async () => {
      const petData = { name: 'Buddy Updated', species: 'Dog', price: 350 };
      const updated = { petId: 'abc', ...petData };
      mockAxiosInstance.put.mockResolvedValue({ data: updated });

      const result = await ApiService.updatePet('abc', petData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/pets/abc', petData);
      expect(result).toEqual(updated);
    });

    it('propagates errors', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404, data: { error: 'Pet not found' } };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(ApiService.updatePet('nonexistent', {})).rejects.toThrow('Not Found');
    });
  });

  describe('deletePet', () => {
    it('calls DELETE /pets/:id and returns data', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { petId: 'abc' } });

      const result = await ApiService.deletePet('abc');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/pets/abc');
      expect(result).toEqual({ petId: 'abc' });
    });

    it('propagates 404 errors', async () => {
      const error = new Error('Not Found');
      error.response = { status: 404, data: { error: 'Pet not found' } };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(ApiService.deletePet('nonexistent')).rejects.toThrow('Not Found');
    });
  });

  describe('updatePetStatus', () => {
    it('calls PATCH /pets/:id/status with status and returns data', async () => {
      const updated = { petId: 'abc', name: 'Buddy', status: 'pending' };
      mockAxiosInstance.patch.mockResolvedValue({ data: updated });

      const result = await ApiService.updatePetStatus('abc', 'pending');

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/pets/abc/status', { status: 'pending' });
      expect(result).toEqual(updated);
    });

    it('propagates errors', async () => {
      const error = new Error('Bad Request');
      error.response = { status: 400, data: { error: 'Invalid status' } };
      mockAxiosInstance.patch.mockRejectedValue(error);

      await expect(ApiService.updatePetStatus('abc', 'invalid')).rejects.toThrow('Bad Request');
    });
  });
});
