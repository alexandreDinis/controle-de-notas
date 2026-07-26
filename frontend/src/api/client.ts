import axios from 'axios';
import toast from 'react-hot-toast';
import type { ApiError } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as ApiError;
      toast.error(data.mensagem || 'Erro inesperado');
    } else {
      toast.error('Erro de conexão com o servidor');
    }
    return Promise.reject(error);
  }
);

export default api;
