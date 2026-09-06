import api from './axiosConfig';

export const getVueEnsemble = () => api.get('bibliotheque/vue-ensemble/');

// Catégories
export const getCategories = () => api.get('bibliotheque/categories/');
export const creerCategorie = (data) => api.post('bibliotheque/categories/', data);
export const modifierCategorie = (id, data) => api.patch(`bibliotheque/categories/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerCategorie = (id) => api.delete(`bibliotheque/categories/${id}/`);

// Auteurs
export const getAuteurs = () => api.get('bibliotheque/auteurs/');
export const getAuteur = (id) => api.get(`bibliotheque/auteurs/${id}/`);
export const creerAuteur = (formData) => api.post('bibliotheque/auteurs/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierAuteur = (id, formData) => api.patch(`bibliotheque/auteurs/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerAuteur = (id) => api.delete(`bibliotheque/auteurs/${id}/`);

// Éditeurs
export const getEditeurs = () => api.get('bibliotheque/editeurs/');
export const creerEditeur = (data) => api.post('bibliotheque/editeurs/', data);
export const modifierEditeur = (id, data) => api.patch(`bibliotheque/editeurs/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerEditeur = (id) => api.delete(`bibliotheque/editeurs/${id}/`);

// Localisations
export const getLocalisations = () => api.get('bibliotheque/localisations/');
export const creerLocalisation = (data) => api.post('bibliotheque/localisations/', data);

// Ressources
export const getRessources = (params) => api.get('bibliotheque/ressources/', { params });
export const getRessource = (id) => api.get(`bibliotheque/ressources/${id}/`);
export const creerRessource = (data) => api.post('bibliotheque/ressources/', data);
export const modifierRessource = (id, data) => api.patch(`bibliotheque/ressources/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerRessource = (id) => api.delete(`bibliotheque/ressources/${id}/`);

// Exemplaires
export const getExemplaires = (params) => api.get('bibliotheque/exemplaires/', { params });
export const creerExemplaire = (data) => api.post('bibliotheque/exemplaires/', data);
export const creerExemplairesEnMasse = (data) => api.post('bibliotheque/exemplaires/en-masse/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierExemplaire = (id, data) => api.patch(`bibliotheque/exemplaires/${id}/`, data);
export const supprimerExemplaire = (id) => api.delete(`bibliotheque/exemplaires/${id}/`);

// Adhérents
export const getAdherents = (params) => api.get('bibliotheque/adherents/', { params });
export const getAdherent = (id) => api.get(`bibliotheque/adherents/${id}/`);
export const creerAdherent = (data) => api.post('bibliotheque/adherents/', data);
export const modifierAdherent = (id, data) => api.patch(`bibliotheque/adherents/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerAdherent = (id) => api.delete(`bibliotheque/adherents/${id}/`);

// Emprunts
export const getEmprunts = (params) => api.get('bibliotheque/emprunts/', { params });
export const enregistrerEmprunt = (data) => api.post('bibliotheque/emprunts/enregistrer/', data);
export const retournerEmprunt = (id, data) => api.post(`bibliotheque/emprunts/${id}/retourner/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getRetards = (params) => api.get('bibliotheque/emprunts/retards/', { params });
export const getHistoriqueEmprunts = (params) => api.get('bibliotheque/emprunts/historique/', { params });

// Réservations
export const getReservations = (params) => api.get('bibliotheque/reservations/', { params });
export const creerReservation = (data) => api.post('bibliotheque/reservations/', data);
export const annulerReservation = (id) => api.patch(`bibliotheque/reservations/${id}/annuler/`);
export const relancerReservations = () => api.post('bibliotheque/reservations/relancer/');

// Inventaires
export const getInventaires = () => api.get('bibliotheque/inventaires/');
export const getInventaire = (id) => api.get(`bibliotheque/inventaires/${id}/`);
export const creerInventaire = (data) => api.post('bibliotheque/inventaires/', data);
export const cloturerInventaire = (id) => api.patch(`bibliotheque/inventaires/${id}/cloturer/`);
export const modifierLigneInventaire = (id, data) => api.patch(`bibliotheque/inventaires/lignes/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });

// Fournisseurs
export const getFournisseurs = () => api.get('bibliotheque/fournisseurs/');
export const creerFournisseur = (data) => api.post('bibliotheque/fournisseurs/', data);
export const modifierFournisseur = (id, data) => api.patch(`bibliotheque/fournisseurs/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerFournisseur = (id) => api.delete(`bibliotheque/fournisseurs/${id}/`);

// Acquisitions
export const getAcquisitions = () => api.get('bibliotheque/acquisitions/');
export const getAcquisition = (id) => api.get(`bibliotheque/acquisitions/${id}/`);
export const creerAcquisition = (data) => api.post('bibliotheque/acquisitions/', data);
export const receptionnerAcquisition = (id) => api.post(`bibliotheque/acquisitions/${id}/reception/`);


export const modifierLocalisation = (id, data) => api.patch(`bibliotheque/localisations/${id}/`, data);
export const supprimerLocalisation = (id) => api.delete(`bibliotheque/localisations/${id}/`);
