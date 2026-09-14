import { useState, useEffect } from 'react';
import { getDossierEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';
import '../../assets/css/espaceEtudiant.css';




function DossierEtudiant() {
  
  const [onglet, setOnglet] = useState('personnelles');
  
  const [donnees, setDonnees] = useState(null);
  
  
  useEffect(() => { getDossierEtudiant().then((res) => setDonnees(res.data)); }, []);
  
  
  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">
  
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>
              Mon dossier étudiant
            </h3>
            <div className="sub">Consultez vos informations personnelles et académiques</div>
          </div>
        </div>
  

        <div className="ee-onglets">
          <button className={`ee-onglet ${onglet === 'personnelles' ? 'active' : ''}`} onClick={() => setOnglet('personnelles')}>Informations personnelles</button>
          <button className={`ee-onglet ${onglet === 'academiques' ? 'active' : ''}`} onClick={() => setOnglet('academiques')}>Informations académiques</button>
        </div>
  
  
        {onglet === 'personnelles' && (
          <div className="ee-carte-profil" style={{ display: 'block' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
              {donnees.photo ? <img src={donnees.photo} alt={donnees.nom} className="ee-avatar" /> : <div className="ee-avatar ee-avatar-placeholder"><i className="fas fa-user"></i></div>}
              <div><h3 style={{ fontWeight: 800 }}>{donnees.nom} {donnees.prenom}</h3><div className="cell-sub mono">{donnees.matricule}</div></div>
            </div>
            <div className="dl-group">
              <div className="dl-row"><span className="dl-k">Sexe</span><span className="dl-v">{donnees.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
              <div className="dl-row"><span className="dl-k">Date de naissance</span><span className="dl-v">{new Date(donnees.date_naissance).toLocaleDateString('fr-FR')}</span></div>
              <div className="dl-row"><span className="dl-k">Téléphone</span><span className="dl-v">{donnees.telephone || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Email</span><span className="dl-v">{donnees.email || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Adresse</span><span className="dl-v">{donnees.adresse || '—'}</span></div>
              <div className="dl-row"><span className="dl-k">Tuteur</span><span className="dl-v">{donnees.nom_tuteur || '—'} ({donnees.telephone_tuteur || '—'})</span></div>
            </div>
          </div>
        )}
        {onglet === 'academiques' && (
          <div className="dl-group">
            <div className="dl-row"><span className="dl-k">Spécialité</span><span className="dl-v">{donnees.specialite}</span></div>
            <div className="dl-row"><span className="dl-k">Classe</span><span className="dl-v">{donnees.classe}</span></div>
            <div className="dl-row"><span className="dl-k">Niveau</span><span className="dl-v">{donnees.niveau}</span></div>
            <div className="dl-row"><span className="dl-k">Année académique</span><span className="dl-v">{donnees.annee_academique}</span></div>
            <div className="dl-row"><span className="dl-k">Statut</span><span className="dl-v"><span className="badge badge-success"><p className='bull'>&bull;</p> {donnees.statut}</span></span></div>
          </div>
        )}
      </div>

    </div>

  );

}


export default DossierEtudiant;

