import api from './axiosConfig';



// Catégorie dépense
export const getCategoriesDepense = () => api.get('finances/categories-depense/');
export const creerCategorieDepense = (data) => api.post('finances/categories-depense/', data);
export const modifierCategorieDepense = (id, data) => api.patch(`finances/categories-depense/${id}/`, data);
export const supprimerCategorieDepense = (id) => api.delete(`finances/categories-depense/${id}/`);


// Type paiement
export const getTypesPaiement = () => api.get('finances/types-paiement/');
export const creerTypePaiement = (data) => api.post('finances/types-paiement/', data);
export const modifierTypePaiement = (id, data) => api.patch(`finances/types-paiement/${id}/`, data);
export const supprimerTypePaiement = (id) => api.delete(`finances/types-paiement/${id}/`);


// Tarif
export const getTarifs = () => api.get('finances/tarifs/');
export const creerTarif = (data) => api.post('finances/tarifs/', data);
export const modifierTarif = (id, data) => api.patch(`finances/tarifs/${id}/`, data);
export const supprimerTarif = (id) => api.delete(`finances/tarifs/${id}/`);
export const getSimulateurTarif = (params) => api.get('finances/tarifs/simulateur/', { params });


// Caisse
export const getCaisses = () => api.get('finances/caisse/');
export const ouvrirCaisse = (data) => api.post('finances/caisse/', data);
export const getCaisseDetail = (id) => api.get(`finances/caisse/${id}/`);
export const fermerCaisse = (id, data) => api.post(`finances/caisse/${id}/fermer/`, data);
export const telechargerCaissePdf = (id) => api.get(`finances/caisse/${id}/pdf/`, { responseType: 'blob' });


// Inscription
export const getInscriptions = () => api.get('finances/inscriptions/');
export const getInscription = (id) => api.get(`finances/inscriptions/${id}/`);
export const creerInscription = (data) => api.post('finances/inscriptions/', data);
export const modifierInscription = (id, data) => api.patch(`finances/inscriptions/${id}/`, data);
export const supprimerInscription = (id) => api.delete(`finances/inscriptions/${id}/`);
export const ajouterFrais = (inscriptionId, data) => api.post(`finances/inscriptions/${inscriptionId}/frais/ajouter/`, data);
export const getTarifSuggere = (params) => api.get('finances/tarif-suggere/', { params });
export const telechargerInscriptionPdf = (id) => api.get(`finances/inscriptions/${id}/pdf/`, { responseType: 'blob' });


// Paiement
export const getPaiements = (params) => api.get('finances/paiements/', { params });
export const getPaiement = (id) => api.get(`finances/paiements/${id}/`);
export const creerPaiement = (data) => api.post('finances/paiements/', data);
export const modifierPaiement = (id, data) => api.patch(`finances/paiements/${id}/`, data);
export const supprimerPaiement = (id) => api.delete(`finances/paiements/${id}/`);
export const telechargerPaiementPdf = (id) => api.get(`finances/paiements/${id}/pdf/`, { responseType: 'blob' });


// Dépense
export const getDepenses = (params) => api.get('finances/depenses/', { params });
export const getDepense = (id) => api.get(`finances/depenses/${id}/`);
export const creerDepense = (formData) => api.post('finances/depenses/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierDepense = (id, formData) => api.patch(`finances/depenses/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerDepense = (id) => api.delete(`finances/depenses/${id}/`);
export const telechargerDepensePdf = (id) => api.get(`finances/depenses/${id}/pdf/`, { responseType: 'blob' });
