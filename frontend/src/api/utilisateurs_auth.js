import api from './axiosConfig';


export const getUtilisateurs = () => api.get('auth/utilisateurs/');

export const getUtilisateur = (id) => api.get(`auth/utilisateurs/${id}/`);

export const creerUtilisateur = (formData) => api.post('auth/utilisateurs/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const modifierUtilisateur = (id, formData) => api.patch(`auth/utilisateurs/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const supprimerUtilisateur = (id) => api.delete(`auth/utilisateurs/${id}/`);