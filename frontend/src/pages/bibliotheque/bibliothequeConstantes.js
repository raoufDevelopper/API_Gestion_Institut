export const TYPES_RESSOURCE = [
  { value: 'LIVRE', label: 'Livre' },
  { value: 'REVUE', label: 'Revue / Périodique' },
  { value: 'MEMOIRE', label: 'Mémoire / Travail académique' },
  { value: 'NUMERIQUE', label: 'Ressource numérique' },
  { value: 'AUTRE', label: 'Autre' },
];

export const ETATS_PHYSIQUE = [
  { value: 'BON', label: 'Bon' },
  { value: 'MOYEN', label: 'Moyen' },
  { value: 'ABIME', label: 'Abîmé' },
  { value: 'TRES_ABIME', label: 'Très abîmé' },
];

export const STATUTS_EXEMPLAIRE = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'EMPRUNTE', label: 'Emprunté' },
  { value: 'RESERVE', label: 'Réservé' },
  { value: 'PERDU', label: 'Perdu' },
  { value: 'ENDOMMAGE', label: 'Endommagé' },
  { value: 'EN_REPARATION', label: 'En réparation' },
  { value: 'RETIRE', label: 'Retiré' },
];

export const BADGE_STATUT_EXEMPLAIRE = {
  DISPONIBLE: 'badge-success', 
  EMPRUNTE: 'badge-violet', 
  RESERVE: 'badge-orange',
  PERDU: 'badge-danger', 
  ENDOMMAGE: 'badge-danger', 
  EN_REPARATION: 'badge-orange', 
  RETIRE: 'badge-aqua',
};

export const STATUTS_ADHERENT = [
  { value: 'ACTIF', label: 'Actif' }, 
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'EXPIRE', label: 'Expiré' }, 
  { value: 'DESACTIVE', label: 'Désactivé' },
];

export const BADGE_STATUT_ADHERENT = {
  ACTIF: 'badge-success', 
  SUSPENDU: 'badge-orange', 
  EXPIRE: 'badge-violet', 
  DESACTIVE: 'badge-danger',
};

export const TYPES_ADHERENT = [
  { value: 'ETUDIANT', label: 'Étudiant' }, 
  { value: 'PERSONNEL', label: 'Personnel' }, 
  { value: 'FORMATEUR', label: 'Formateur' },
];

export const STATUTS_EMPRUNT = [
  { value: 'EN_COURS', label: 'En cours' }, 
  { value: 'RETOURNE', label: 'Retourné' },
  { value: 'EN_RETARD', label: 'En retard' }, 
  { value: 'PERDU', label: 'Perdu' }, 
  { value: 'ANNULE', label: 'Annulé' },
];

export const BADGE_STATUT_EMPRUNT = {
  EN_COURS: 'badge-aqua', 
  RETOURNE: 'badge-success', 
  EN_RETARD: 'badge-danger', 
  PERDU: 'badge-danger', 
  ANNULE: 'badge-orange',
};

export const STATUTS_RESERVATION = [
  { value: 'EN_ATTENTE', label: 'En attente' }, 
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'RETIREE', label: 'Retirée' }, 
  { value: 'EXPIREE', label: 'Expirée' },
  { value: 'ANNULEE', label: 'Annulée' }, 
  { value: 'TERMINEE', label: 'Terminée' },
];

export const BADGE_STATUT_RESERVATION = {
  EN_ATTENTE: 'badge-aqua', 
  DISPONIBLE: 'badge-success', 
  RETIREE: 'badge-orange',
  EXPIREE: 'badge-violet', 
  ANNULEE: 'badge-danger', 
  TERMINEE: 'badge-blue',
};

export const STATUTS_ACQUISITION = [
  { value: 'EN_PREPARATION', label: 'En préparation' }, 
  { value: 'COMMANDEE', label: 'Commandée' },
  { value: 'RECUE', label: 'Reçue' }, 
  { value: 'PARTIELLEMENT_RECUE', label: 'Partiellement reçue' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export const BADGE_STATUT_ACQUISITION = {
  EN_PREPARATION: 'badge-orange', 
  COMMANDEE: 'badge-violet', 
  RECUE: 'badge-success',
  PARTIELLEMENT_RECUE: 'badge-aqua', 
  ANNULEE: 'badge-danger',
};

export const STATUTS_CONSTATE = [
  { value: 'PRESENT', label: 'Présent' }, 
  { value: 'INTROUVABLE', label: 'Introuvable' },
  { value: 'ENDOMMAGE', label: 'Endommagé' }, 
  { value: 'INCOHERENT', label: 'Incohérent' }, 
  { value: 'A_VERIFIER', label: 'À vérifier' },
];

export const BADGE_STATUT_CONSTATE = {
  PRESENT: 'badge-success', 
  INTROUVABLE: 'badge-danger', 
  ENDOMMAGE: 'badge-danger',
  INCOHERENT: 'badge-orange', 
  A_VERIFIER: 'badge-violet',
};

