import api from './axiosConfig';

export const getPermissions = () => api.get('auth/permissions/');

export const getPermission = (id) => api.get(`auth/permissions/${id}/`);