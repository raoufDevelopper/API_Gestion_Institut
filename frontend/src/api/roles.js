import api from './axiosConfig';


export const getRoles = () => api.get('auth/roles/');

export const getRole = (id) => api.get(`auth/roles/${id}/`);

export const creerRole = (data) => api.post('auth/roles/', data);

export const modifierRole = (id, data) => api.patch(`auth/roles/${id}/`, data);

export const supprimerRole = (id) => api.delete(`auth/roles/${id}/`);
