import api from './axiosConfig';




// Niveau
export const getNiveaux = () => api.get('academique/niveaux/');

export const creerNiveau = (data) => api.post('academique/niveaux/', data);

export const modifierNiveau = (id, data) => api.patch(`academique/niveaux/${id}/`, data);

export const supprimerNiveau = (id) => api.delete(`academique/niveaux/${id}/`);


// Filière
export const getFilieres = () => api.get('academique/filieres/');

export const creerFiliere = (data) => api.post('academique/filieres/', data);

export const modifierFiliere = (id, data) => api.patch(`academique/filieres/${id}/`, data);

export const supprimerFiliere = (id) => api.delete(`academique/filieres/${id}/`);


// Spécialité
export const getSpecialites = () => api.get('academique/specialites/');

export const creerSpecialite = (data) => api.post('academique/specialites/', data);

export const modifierSpecialite = (id, data) => api.patch(`academique/specialites/${id}/`, data);

export const supprimerSpecialite = (id) => api.delete(`academique/specialites/${id}/`);


// Type Salle
export const getTypesSalle = () => api.get('academique/types-salle/');

export const creerTypeSalle = (data) => api.post('academique/types-salle/', data);

export const modifierTypeSalle = (id, data) => api.patch(`academique/types-salle/${id}/`, data);

export const supprimerTypeSalle = (id) => api.delete(`academique/types-salle/${id}/`);


// Salle
export const getSalles = () => api.get('academique/salles/');

export const creerSalle = (data) => api.post('academique/salles/', data);

export const modifierSalle = (id, data) => api.patch(`academique/salles/${id}/`, data);

export const supprimerSalle = (id) => api.delete(`academique/salles/${id}/`);


// Matière
export const getMatieres = () => api.get('academique/matieres/');

export const creerMatiere = (data) => api.post('academique/matieres/', data);

export const modifierMatiere = (id, data) => api.patch(`academique/matieres/${id}/`, data);

export const supprimerMatiere = (id) => api.delete(`academique/matieres/${id}/`);


// Classe
export const getClasses = () => api.get('academique/classes/');

export const creerClasse = (data) => api.post('academique/classes/', data);

export const modifierClasse = (id, data) => api.patch(`academique/classes/${id}/`, data);

export const supprimerClasse = (id) => api.delete(`academique/classes/${id}/`);


// Sanction
export const getSanctions = () => api.get('academique/sanctions/');

export const creerSanction = (data) => api.post('academique/sanctions/', data);

export const modifierSanction = (id, data) => api.patch(`academique/sanctions/${id}/`, data);

export const supprimerSanction = (id) => api.delete(`academique/sanctions/${id}/`);


// Année académique
export const getAnneesAcademiques = () => api.get('academique/annees-academiques/');

export const creerAnneeAcademique = (data) => api.post('academique/annees-academiques/', data);

export const modifierAnneeAcademique = (id, data) => api.patch(`academique/annees-academiques/${id}/`, data);

export const supprimerAnneeAcademique = (id) => api.delete(`academique/annees-academiques/${id}/`);