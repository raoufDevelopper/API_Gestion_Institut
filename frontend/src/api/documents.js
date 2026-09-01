import api from './axiosConfig';


export const getDocumentsOverview = () => api.get('documents/overview/');
// Diplome
export const getDiplomes = () => api.get('documents/diplomes/');
export const getDiplome = (id) => api.get(`documents/diplomes/${id}/`);
export const creerDiplome = (data) => api.post('documents/diplomes/', data);
export const revoquerDiplome = (id, data) => api.patch(`documents/diplomes/${id}/revoquer/`, data);
export const telechargerDiplome = (id) => api.get(`documents/diplomes/${id}/telecharger/`, { responseType: 'blob' });
export const getDeliberationsEligibles = (params) => api.get('documents/diplomes/deliberations-eligibles/', { params });
// TypeCertificat
export const getTypesCertificat = () => api.get('documents/types-certificat/');
export const creerTypeCertificat = (data) => api.post('documents/types-certificat/', data);
export const modifierTypeCertificat = (id, data) => api.patch(`documents/types-certificat/${id}/`, data);
export const supprimerTypeCertificat = (id) => api.delete(`documents/types-certificat/${id}/`);
// Certificat
export const getCertificats = () => api.get('documents/certificats/');
export const creerCertificat = (data) => api.post('documents/certificats/', data);
export const supprimerCertificat = (id) => api.delete(`documents/certificats/${id}/`);
export const telechargerCertificat = (id) => api.get(`documents/certificats/${id}/telecharger/`, { responseType: 'blob' });
// Document
export const getDocuments = () => api.get('documents/documents/');
export const getDocument = (id) => api.get(`documents/documents/${id}/`);
export const creerDocument = (formData) => api.post('documents/documents/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const modifierDocument = (id, formData) => api.patch(`documents/documents/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const supprimerDocument = (id) => api.delete(`documents/documents/${id}/`);