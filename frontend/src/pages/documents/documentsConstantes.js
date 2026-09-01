export const STATUTS_DIPLOME = [
  { value: 'valide', label: 'Valide' },
  { value: 'revoque', label: 'Révoqué' },
];

export const BADGE_STATUT_DIPLOME = {
  valide: 'badge-success',
  revoque: 'badge-danger',
};

export const ICONE_TYPE_RECENT = {
  diplome: 'fa-graduation-cap',
  certificat: 'fa-certificate',
  document: 'fa-file',
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