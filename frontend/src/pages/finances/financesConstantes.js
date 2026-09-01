export const STATUTS_INSCRIPTION = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'VALIDEE', label: 'Validée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export const BADGE_STATUT_INSCRIPTION = {
  EN_ATTENTE: 'badge-aqua',
  VALIDEE: 'badge-success',
  ANNULEE: 'badge-danger',
};

export const BADGE_STATUT_FINANCIER = {
  PAYE: 'badge-success',
  PARTIEL: 'badge-warning',
  NON_PAYE: 'badge-danger',
};

export const LABEL_STATUT_FINANCIER = {
  PAYE: 'Payé',
  PARTIEL: 'Partiel',
  NON_PAYE: 'Non payé',
};

export const BADGE_STATUT_CAISSE = {
  OUVERTE: 'badge-success',
  FERMEE: 'badge-orange',
};

export function telechargerFichier(blob, nomFichier) {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomFichier);
  document.body.appendChild(link);
  link.click();
  link.remove();
}



export const MODES_PAIEMENT = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'VIREMENT', label: 'Virement' },
  { value: 'MOBILE', label: 'Mobile Money' },
];

export const MODES_DEPENSE = [
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'CHEQUE', label: 'Chèque' },
  { value: 'VIREMENT', label: 'Virement' },
];

export const STATUTS_PAIEMENT = [
  { value: 'VALIDE', label: 'Validé' },
  { value: 'ANNULE', label: 'Annulé' },
  { value: 'REMBOURSE', label: 'Remboursé' },
];

export const BADGE_STATUT_PAIEMENT = {
  VALIDE: 'badge-success',
  ANNULE: 'badge-danger',
  REMBOURSE: 'badge-orange',
};

export const STATUTS_DEPENSE = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVEE', label: 'Approuvée' },
  { value: 'REJETEE', label: 'Rejetée' },
  { value: 'PAYEE', label: 'Payée' },
];

export const BADGE_STATUT_DEPENSE = {
  EN_ATTENTE: 'badge-aqua',
  APPROUVEE: 'badge-violet',
  REJETEE: 'badge-danger',
  PAYEE: 'badge-success',
};

