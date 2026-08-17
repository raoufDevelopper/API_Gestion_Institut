import api from './axiosConfig';

export const login = (email, password) => {
  return api.post('auth/login/', { email, password });
};

export const logout = (refreshToken) => {
  return api.post('auth/logout/', { refresh: refreshToken });
};

export const register = (formData) => {
  return api.post('auth/register/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMe = () => {
  return api.get('auth/me/');
};

export const getStatutAbonnement = () => {
  return api.get('parametres/abonnement/statut/');
};