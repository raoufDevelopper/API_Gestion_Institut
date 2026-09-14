import api from './axiosConfig';


export const getAccueilEtudiant = () => api.get('espace-etudiant/accueil/');

export const getPlanningEtudiant = (params) => api.get('espace-etudiant/planning/', { params });

export const getResultatsEtudiant = (params) => api.get('espace-etudiant/resultats/', { params });

export const getFormationEtudiant = () => api.get('espace-etudiant/formation/');

export const getFinancesEtudiant = () => api.get('espace-etudiant/finances/');

export const getDocumentsEtudiant = () => api.get('espace-etudiant/documents/');

export const getDossierEtudiant = () => api.get('espace-etudiant/dossier/');

export const getMonCompte = () => api.get('espace-etudiant/compte/');

export const modifierMonCompte = (formData) => api.patch('espace-etudiant/compte/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const changerMotDePasse = (data) => api.post('espace-etudiant/compte/mot-de-passe/', data);


export const getMesResultatsComplet = (params) => api.get('espace-etudiant/resultats/complet/', { params });

export const getMonClassementClasse = (params) => api.get('espace-etudiant/resultats/classement/', { params });

export const getMonReleveComplet = (params) => api.get('espace-etudiant/releve-complet/', { params });

export const getFiltresResultatsEtudiant = () => api.get('espace-etudiant/resultats/filtres/');
