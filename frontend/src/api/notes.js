import api from './axiosConfig';


// Types d'évaluation
export const getTypesEvaluation = () => api.get('notes/types-evaluation/');
export const creerTypeEvaluation = (data) => api.post('notes/types-evaluation/', data);
export const modifierTypeEvaluation = (id, data) => api.patch(`notes/types-evaluation/${id}/`, data);
export const supprimerTypeEvaluation = (id) => api.delete(`notes/types-evaluation/${id}/`);

// Saisie
export const getContexteSaisie = (params) => api.get('notes/saisie/contexte/', { params });
export const saisirNotes = (payload) => api.post('notes/saisie/', payload);

// consultation
export const getConsultationNotes = (params) => api.get('notes/consultation/', { params });
export const telechargerConsultationPdf = (params) => api.get('notes/consultation/pdf/', { params, responseType: 'blob' });

// releve
export const getReleveNotes = (params) => api.get('notes/releve/', { params });
export const telechargerRelevePdf = (params) => api.get('notes/releve/pdf/', { params, responseType: 'blob' });

// deliberation
export const getDeliberations = (params) => api.get('notes/deliberation/', { params });
export const calculerDeliberations = (params) => api.post('notes/deliberation/', null, { params });
export const toggleVerrouillageDeliberation = (id) => api.patch(`notes/deliberation/${id}/verrouiller/`);
export const telechargerDeliberationPdf = (params) => api.get('notes/deliberation/pdf/', { params, responseType: 'blob' });