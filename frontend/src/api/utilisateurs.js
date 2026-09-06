import api from './axiosConfig';


// Étudiants
export const getEtudiants = () => api.get('utilisateurs/etudiants/');

export const getEtudiant = (id) => api.get(`utilisateurs/etudiants/${id}/`);

export const modifierEtudiant = (id, formData) => api.patch(`utilisateurs/etudiants/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const supprimerEtudiant = (id) => api.delete(`utilisateurs/etudiants/${id}/`);

export const telechargerFicheEtudiant = (id) => api.get(`utilisateurs/etudiants/${id}/export-pdf/`, { responseType: 'blob' });



// Personnel
export const getPersonnels = () => api.get('utilisateurs/personnel/');

export const getPersonnel = (id) => api.get(`utilisateurs/personnel/${id}/`);

export const modifierPersonnel = (id, formData) => api.patch(`utilisateurs/personnel/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const supprimerPersonnel = (id) => api.delete(`utilisateurs/personnel/${id}/`);

export const telechargerFichePersonnel = (id) => api.get(`utilisateurs/personnel/${id}/export-pdf/`, { responseType: 'blob' });


// Formateurs
export const getFormateurs = (params) => api.get('utilisateurs/formateurs/', { params });

export const getFormateur = (id) => api.get(`utilisateurs/formateurs/${id}/`);

export const modifierFormateur = (id, data) => api.patch(`utilisateurs/formateurs/${id}/`, data);

export const supprimerFormateur = (id) => api.delete(`utilisateurs/formateurs/${id}/`);

export const telechargerFicheFormateur = (id) => api.get(`utilisateurs/formateurs/${id}/export-pdf/`, { responseType: 'blob' });



// utilisateurs disponibles
export const getUtilisateursDisponiblesEtudiant = () => api.get('utilisateurs/utilisateurs-disponibles/etudiant/');

export const getUtilisateursDisponiblesPersonnel = () => api.get('utilisateurs/utilisateurs-disponibles/personnel/');

export const getUtilisateursDisponiblesFormateur = () => api.get('utilisateurs/utilisateurs-disponibles/formateur/');
