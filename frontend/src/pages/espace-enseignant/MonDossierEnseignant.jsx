import { useState, useEffect } from 'react';
import { getMonDossierEnseignant } from '../../api/espaceEnseignant';
import Loader from '../../components/Loader';
import { formatMontant } from '../../components/formatters';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';






function MonDossierEnseignant() {
  const [onglet, setOnglet] = useState('personnelles');
  const [donnees, setDonnees] = useState(null);
  useEffect(() => { getMonDossierEnseignant().then((res) => setDonnees(res.data)); }, []);
  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;
  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head"><div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mon dossier</h3><div className="sub">Consultez vos informations personnelles et professionnelles</div></div></div>
        <div className="ee-onglets">
          <button className={`ee-onglet ${onglet === 'personnelles' ? 'active' : ''}`} onClick={() => setOnglet('personnelles')}>Informations personnelles</button>
          <button className={`ee-onglet ${onglet === 'professionnelles' ? 'active' : ''}`} onClick={() => setOnglet('professionnelles')}>Informations professionnelles</button>
        </div>
        {onglet === 'personnelles' && (
          <div className="ee-carte-profil" style={{ display: 'block' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
              {donnees.photo ? <img src={donnees.photo} alt={donnees.nom} className="ee-avatar" /> : <div className="ee-avatar ee-avatar-placeholder"><i className="fas fa-user"></i></div>}
              <div><h3 style={{ fontWeight: 800 }}>{donnees.nom} {donnees.prenom}</h3><div className="cell-sub mono">{donnees.matricule}</div></div>
            </div>
            <div className="dl-group">
              <div className="dl-row"><span className="dl-k">Sexe</span><span className="dl-v">{donnees.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
              <div className="dl-row"><span className="dl-k">Date de naissance</span><span className="dl-v">{donnees.date_naissance ? new Date(donnees.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }): '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Téléphone</span><span className="dl-v">{donnees.telephone || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Email</span><span className="dl-v">{donnees.email || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Adresse</span><span className="dl-v">{donnees.adresse || '—'}</span></div>
            </div>
          </div>
        )}
        {onglet === 'professionnelles' && (
          <div className="dl-group">
            <div className="dl-row"><span className="dl-k">Poste</span><span className="dl-v">{donnees.poste || '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Salaire</span><span className="dl-v">{formatMontant(donnees.salaire) || '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Fonction</span><span className="dl-v">{donnees.fonction || '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Type de contrat</span><span className="badge-orange">{donnees.type_contrat}</span></div>
            <div className="dl-row"><span className="dl-k">Date d'embauche</span><span className="dl-v">{donnees.date_embauche ? new Date(donnees.date_embauche).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }): '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Filière(s)</span><span className="badge-violet">{donnees.filieres.join(', ') || '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Spécialité(s)</span><span className="dl-v">{donnees.specialites.join(' # ') || '—'}</span></div>
            <div className="dl-row"><span className="dl-k">Classes enseignées (année active)</span><span className="dl-v">{donnees.nb_classes_actuelles} classes</span></div>
            <div className="dl-row"><span className="dl-k">Matières enseignées (année active)</span><span className="dl-v">{donnees.nb_matieres_actuelles} matières</span></div>
            <div className="dl-row"><span className="dl-k">Statut</span><span className="dl-v"><span className="badge badge-success"><p className='bull'>&bull;</p> {donnees.statut}</span></span></div>
          </div>
        )}
      </div>
    </div>
  );
}
export default MonDossierEnseignant;