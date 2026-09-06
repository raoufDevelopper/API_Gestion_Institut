import api from './axiosConfig';

export const getParametreInstitut = () => api.get('parametres/institut/');

export const getConfigurationsMatricule = () => api.get('parametres/config-matricule/');

export const updateConfigurationMatricule = (id, data) => api.patch(`parametres/config-matricule/${id}/`, data);

export const creerConfigurationMatricule = (data) => api.post('parametres/config-matricule/', data);

export const updateParametreInstitut = (formData) => api.patch('parametres/institut/', formData, {headers: { 'Content-Type': 'multipart/form-data' },});

export const getSauvegardes = () => api.get('parametres/sauvegardes/');

export const lancerSauvegarde = () => api.post('parametres/sauvegardes/lancer/');

export const telechargerSauvegarde = (id) => api.get(`parametres/sauvegardes/${id}/telecharger/`, { responseType: 'blob' });

export const supprimerSauvegarde = (id) => api.delete(`parametres/sauvegardes/${id}/`);

export const getArchives = () => api.get('parametres/archives/');

export const archiverAnneeAcademique = (id, data) => api.post(`parametres/archives/annees-academiques/${id}/archiver/`, data);

