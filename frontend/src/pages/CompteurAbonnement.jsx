import { useState, useEffect, useRef } from 'react';
import { getTempsRestantAbonnement } from '../api/parametres';
import ChiffreSegments from '../components/ChiffreSegments';
import Loader from '../components/Loader';
import '../assets/css/compteurAbonnement.css';



function paireChiffres(valeur) {
  const str = String(valeur).padStart(2, '0').slice(-2);
  return [Number(str[0]), Number(str[1])];
}



function decomposerDepuisEpoch(activationMs, expirationMs) {
  const maintenant = Date.now();
  const resteMs = expirationMs - maintenant;
  if (resteMs <= 0) return null;
  const debut = new Date(activationMs);
  const fin = new Date(maintenant);
  let mois = (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
  const dateTest = new Date(debut);
  dateTest.setMonth(dateTest.getMonth() + mois);
  if (dateTest > fin) mois -= 1;
  if (mois < 0) mois = 0;
  const pointApresMois = new Date(debut);
  pointApresMois.setMonth(pointApresMois.getMonth() + mois);
  const finReelle = new Date(expirationMs);
  const resteDepuisPoint = Math.max(finReelle - Math.max(pointApresMois, fin), 0) + Math.max(fin - pointApresMois, 0) * 0;
  // Recalcule le reste directement entre "maintenant" et "expiration", après avoir retranché les mois pleins déjà écoulés depuis l'activation
  const pointApresMoisDepuisMaintenant = new Date(maintenant);
  const secondesRestantesTotal = Math.floor(resteMs / 1000);
  // Reste en jours/h/min/s = temps restant total moins les mois pleins restants (calculés depuis maintenant vers expiration)
  let moisRestants = (finReelle.getFullYear() - fin.getFullYear()) * 12 + (finReelle.getMonth() - fin.getMonth());
  const dateApresMoisRestants = new Date(fin);
  dateApresMoisRestants.setMonth(dateApresMoisRestants.getMonth() + moisRestants);
  if (dateApresMoisRestants > finReelle) moisRestants -= 1;
  if (moisRestants < 0) moisRestants = 0;
  const pointFinal = new Date(fin);
  pointFinal.setMonth(pointFinal.getMonth() + moisRestants);
  const resteApresMoisMs = Math.max(finReelle - pointFinal, 0);
  const resteApresMoisSec = Math.floor(resteApresMoisMs / 1000);
  const jours = Math.floor(resteApresMoisSec / 86400);
  const heures = Math.floor((resteApresMoisSec % 86400) / 3600);
  const minutes = Math.floor((resteApresMoisSec % 3600) / 60);
  const secondes = resteApresMoisSec % 60;
  return { mois: moisRestants, jours, heures, minutes, secondes };
}
function CompteurAbonnement() {
  const [donneesServeur, setDonneesServeur] = useState(null);
  const [affichage, setAffichage] = useState(null);
  const [chargement, setChargement] = useState(true);
  const intervalRef = useRef(null);
  useEffect(() => {
    getTempsRestantAbonnement().then((res) => {
      setDonneesServeur(res.data);
      setChargement(false);
    });
  }, []);
  useEffect(() => {
    if (!donneesServeur?.actif) return;
    const activationMs = new Date(donneesServeur.date_activation).getTime();
    const expirationMs = donneesServeur.expiration_epoch_ms;
    const tick = () => {
      const resultat = decomposerDepuisEpoch(activationMs, expirationMs);
      setAffichage(resultat); // null si expiré → re-render vers l'état "expiré"
    };
    tick(); // calcul immédiat, pas d'attente de 1s avant le premier affichage
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [donneesServeur]);
  if (chargement) return <div className="ca-page"><Loader label="Chargement..." /></div>;
  if (!donneesServeur?.actif || affichage === null) {
    return (
      <div className="ca-page">
        <div className="ca-container">
          <h1 className="ca-title">ABONNEMENT</h1>
          <div className="ca-expire-message">
            {donneesServeur?.expire || affichage === null ? 'ABONNEMENT EXPIRÉ' : 'AUCUN ABONNEMENT ACTIF'}
          </div>
        </div>
      </div>
    );
  }
  const unites = [
    { valeur: affichage.mois, label: 'MOIS' },
    { valeur: affichage.jours, label: 'JOURS' },
    { valeur: affichage.heures, label: 'HEURES' },
    { valeur: affichage.minutes, label: 'MINUTES' },
    { valeur: affichage.secondes, label: 'SECONDES' },
  ];
  return (
    <div className="ca-page">
      <div className="ca-container">
        <h1 className="ca-title">TEMPS RESTANT</h1>
        <div className="ca-timer">
          {unites.map((u) => {
            const [d1, d2] = paireChiffres(u.valeur);
            return (
              <div className="ca-unit" key={u.label}>
                <div className="ca-number">
                  <ChiffreSegments valeur={d1} />
                  <ChiffreSegments valeur={d2} />
                </div>
                <div className="ca-label">{u.label}</div>
              </div>
            );
          })}
        </div>
        <div className="ca-bottom">
          <div className="ca-bottom-texte">
            Expiration le {new Date(donneesServeur.date_expiration).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CompteurAbonnement;