import api from './axiosConfig';
export const getEmploisDuTemps = () => api.get('academique/emplois-du-temps/');
export const getEmploiDuTemps = (id) => api.get(`academique/emplois-du-temps/${id}/`);
export const creerEmploiDuTemps = (data) => api.post('academique/emplois-du-temps/', data);
export const modifierEmploiDuTemps = (id, data) => api.patch(`academique/emplois-du-temps/${id}/`, data);
export const supprimerEmploiDuTemps = (id) => api.delete(`academique/emplois-du-temps/${id}/`);
export const dupliquerEmploiDuTemps = (id) => api.post(`academique/emplois-du-temps/${id}/dupliquer/`);
export const telechargerEmploiDuTempsPdf = (id) =>
  api.get(`academique/emplois-du-temps/${id}/export-pdf/`, { responseType: 'blob' });
export const getSeances = (emploiDuTempsId) =>
  api.get(`academique/seances/?emploi_du_temps=${emploiDuTempsId}`);
export const creerSeance = (data) => api.post('academique/seances/', data);
export const modifierSeance = (id, data) => api.patch(`academique/seances/${id}/`, data);
export const supprimerSeance = (id) => api.delete(`academique/seances/${id}/`);