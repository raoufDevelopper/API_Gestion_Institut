import api from './axiosConfig';

export const getParametreInstitut = () => api.get('parametres/institut/');

export const getConfigurationsMatricule = () => api.get('parametres/config-matricule/');

export const updateConfigurationMatricule = (id, data) =>
  api.patch(`parametres/config-matricule/${id}/`, data);

export const creerConfigurationMatricule = (data) =>
  api.post('parametres/config-matricule/', data);

export const updateParametreInstitut = (formData) =>
  api.patch('parametres/institut/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });