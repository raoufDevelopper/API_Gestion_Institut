import api from './axiosConfig';
// Étudiants
export const getEtudiants = () => api.get('utilisateurs/etudiants/');
export const creerEtudiant = (formData) =>
  api.post('utilisateurs/etudiants/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierEtudiant = (id, formData) =>
  api.patch(`utilisateurs/etudiants/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerEtudiant = (id) => api.delete(`utilisateurs/etudiants/${id}/`);
export const getUtilisateursDisponiblesEtudiant = () => api.get('utilisateurs/utilisateurs-disponibles/etudiant/');
// Personnel
export const getPersonnels = () => api.get('utilisateurs/personnel/');
export const creerPersonnel = (formData) =>
  api.post('utilisateurs/personnel/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierPersonnel = (id, formData) =>
  api.patch(`utilisateurs/personnel/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerPersonnel = (id) => api.delete(`utilisateurs/personnel/${id}/`);
export const getUtilisateursDisponiblesPersonnel = () => api.get('utilisateurs/utilisateurs-disponibles/personnel/');
// Formateurs
export const getFormateurs = () => api.get('utilisateurs/formateurs/');
export const creerFormateur = (data) => api.post('utilisateurs/formateurs/', data);
export const modifierFormateur = (id, data) => api.patch(`utilisateurs/formateurs/${id}/`, data);
export const supprimerFormateur = (id) => api.delete(`utilisateurs/formateurs/${id}/`);
export const getPersonnelDisponibleFormateur = () => api.get('utilisateurs/personnel-disponible/formateur/');