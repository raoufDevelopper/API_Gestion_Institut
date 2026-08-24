export const JOURS = [
  { code: 'LUN', label: 'Lundi' },
  { code: 'MAR', label: 'Mardi' },
  { code: 'MER', label: 'Mercredi' },
  { code: 'JEU', label: 'Jeudi' },
  { code: 'VEN', label: 'Vendredi' },
  { code: 'SAM', label: 'Samedi' },
  { code: 'DIM', label: 'Dimanche' },
];

export const TYPES_SEANCE = [
  { value: 'CM', label: 'Cours Magistral' },
  { value: 'TD', label: 'Travaux Dirigés' },
  { value: 'TP', label: 'Travaux Pratiques' },
  { value: 'EX', label: 'Examen' },
];

export const SEMESTRES = [
  { value: 'S1', label: 'Semestre 1' },
  { value: 'S2', label: 'Semestre 2' },
];

export const STATUTS_EMPLOI = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'publie', label: 'Publié' },
  { value: 'archive', label: 'Archivé' },
];

export const CLASSE_BADGE_STATUT = {
  brouillon: 'badge-danger',
  publie: 'badge-success',
  archive: 'badge-aqua',
};


// Détecte les conflits entre séances saisies dans le même formulaire,
// avant même d'envoyer au serveur (jour, chevauchement d'heure, même salle/formateur/classe).
export function detecterConflitsLocaux(seancesParJour) {

  const conflits = [];

  JOURS.forEach(({ code, label }) => {

    const seances = seancesParJour[code] || [];

    for (let i = 0; i < seances.length; i++) {
      for (let j = i + 1; j < seances.length; j++) {
        const a = seances[i];
        const b = seances[j];
        if (!a.heure_debut || !a.heure_fin || !b.heure_debut || !b.heure_fin) continue;
        const chevauche = a.heure_debut < b.heure_fin && a.heure_fin > b.heure_debut;
        if (!chevauche) continue;
        if (a.salle && a.salle === b.salle) {
          conflits.push(`${label} : conflit de salle entre deux séances (${a.heure_debut}-${a.heure_fin} / ${b.heure_debut}-${b.heure_fin}).`);
        }
        if (a.formateur && a.formateur === b.formateur) {
          conflits.push(`${label} : conflit de formateur entre deux séances (${a.heure_debut}-${a.heure_fin} / ${b.heure_debut}-${b.heure_fin}).`);
        }
      }
    }
  });

  return conflits;

}