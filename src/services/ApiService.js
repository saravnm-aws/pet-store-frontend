import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ApiService = {
  async getAllPets() {
    const response = await apiClient.get('/pets');
    return response.data;
  },

  async getPetById(id) {
    const response = await apiClient.get(`/pets/${id}`);
    return response.data;
  },

  async createPet(data) {
    const response = await apiClient.post('/pets', data);
    return response.data;
  },

  async updatePet(id, data) {
    const response = await apiClient.put(`/pets/${id}`, data);
    return response.data;
  },

  async deletePet(id) {
    const response = await apiClient.delete(`/pets/${id}`);
    return response.data;
  },
};

export default ApiService;
