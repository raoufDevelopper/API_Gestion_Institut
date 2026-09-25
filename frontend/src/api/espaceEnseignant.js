import api from './axiosConfig';



export const getAccueilEnseignant = () => api.get('espace-enseignant/accueil/');

export const getPlanningEnseignant = (params) => api.get('espace-enseignant/planning/', { params });

export const getMesClassesMatieres = () => api.get('espace-enseignant/mes-classes-matieres/');

export const getContexteSaisieEnseignant = (params) => api.get('espace-enseignant/saisie/contexte/', { params });

export const enregistrerNotesEnseignant = (data) => api.post('espace-enseignant/saisie/enregistrer/', data);

export const getCombosPourSaisie = () => api.get('espace-enseignant/saisie/combos/');

export const getCombosPourConsultation = () => api.get('espace-enseignant/consultation/combos/');

export const getConsultationEnseignant = (params) => api.get('espace-enseignant/consultation/', { params });

export const getMesEtudiants = (params) => api.get('espace-enseignant/mes-etudiants/', { params });

export const getResultatsMatieres = () => api.get('espace-enseignant/resultats-matieres/');

export const getMonCompteEnseignant = () => api.get('espace-enseignant/compte/');

export const modifierMonCompteEnseignant = (formData) => api.patch('espace-enseignant/compte/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const changerMotDePasseEnseignant = (data) => api.post('espace-enseignant/compte/mot-de-passe/', data);

export const getDetailEtudiantEnseignant = (id, params) => api.get(`espace-enseignant/etudiants/${id}/`, { params });



export const getMonDossierEnseignant = () => api.get('espace-enseignant/dossier/');

export const getMesEmploisDuTemps = () => api.get('espace-enseignant/mes-emplois-du-temps/');

export const telechargerMonPlanningEnseignant = (edtId) => api.get(`espace-enseignant/planning/${edtId}/pdf/`, { responseType: 'blob' });

