import api from './axiosConfig';
export const getPermissions = () => api.get('auth/permissions/');
export const getPermission = (id) => api.get(`auth/permissions/${id}/`);
export const creerPermission = (data) => api.post('auth/permissions/', data);
export const modifierPermission = (id, data) => api.patch(`auth/permissions/${id}/`, data);
export const supprimerPermission = (id) => api.delete(`auth/permissions/${id}/`);