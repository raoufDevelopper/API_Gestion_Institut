import api from './axiosConfig';


export const creerEtudiantComplet = (formData) => api.post('utilisateurs/etudiants/creer-complet/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const creerPersonnelComplet = (formData) => api.post('utilisateurs/personnel/creer-complet/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const creerFormateurComplet = (formData) => api.post('utilisateurs/formateurs/creer-complet/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

