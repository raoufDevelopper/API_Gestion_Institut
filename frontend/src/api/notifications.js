
import api from './axiosConfig';

export const getNotifications = () => api.get('parametres/notifications/');

export const toggleLecture = (id) => api.patch(`parametres/notifications/${id}/toggle-lecture/`);

export const marquerLue = (id) => api.patch(`parametres/notifications/${id}/lue/`);

export const supprimerNotification = (id) => api.delete(`parametres/notifications/${id}/`);

export const marquerToutesLues = () => api.patch('parametres/notifications/toutes-lues/');

export const effacerLues = () => api.delete('parametres/notifications/effacer-lues/');