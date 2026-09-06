import api from './axiosConfig';


export const getDashboardAcademique = (params) => api.get('statistiques/academique/', { params });

export const getFiltresAcademique = () => api.get('statistiques/academique/filtres/');

export const getDashboardBibliotheque = (params) => api.get('statistiques/bibliotheque/', { params });

export const getFiltresBibliotheque = () => api.get('statistiques/bibliotheque/filtres/');

export const getDashboardFinance = (params) => api.get('statistiques/finance/', { params });

export const getFiltresFinance = () => api.get('statistiques/finance/filtres/');

export const getDashboardDocuments = (params) => api.get('statistiques/documents/', { params });

export const getFiltresDocuments = () => api.get('statistiques/documents/filtres/');

export const exporterAcademiquePdf = (params) => api.get('statistiques/academique/export/pdf/', { params, responseType: 'blob' });

export const exporterAcademiqueExcel = (params) => api.get('statistiques/academique/export/excel/', { params, responseType: 'blob' });


