
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonnel } from '../../api/utilisateurs';
import { telechargerFichePersonnel } from '../../api/utilisateurs';
import { telechargerFichier } from '../finances/financesConstantes';
import { STATUTS_PERSONNEL, BADGE_STATUT_PERSONNEL } from './utilisateursConstantes';
import '../../assets/css/detailUtilisateur.css';



const ONGLETS = [
  { id: 'tous', label: 'Tous' },
  { id: 'identite', label: 'Informations d\'identité', icone: 'fa-address-card' },
  { id: 'coordonnees', label: 'Coordonnées', icone: 'fa-phone' },
  { id: 'professionnel', label: 'Informations professionnelles', icone: 'fa-briefcase' },
  { id: 'documents', label: 'Documents', icone: 'fa-file' },
];

function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState(null);
  const [ongletActif, setOngletActif] = useState('tous');
  useEffect(() => {
    getPersonnel(id).then((res) => setPersonnel(res.data));
  }, [id]);

  if (!personnel) {
    return <div className="ud-page"><div className="empty">Chargement...</div></div>;
  }


  const imprimerFiche = async () => {
    try {
        const res = await telechargerFichePersonnel(id);
        telechargerFichier(res.data, `fiche_personnel_${personnel.matricule}.pdf`);
    } catch (err) {
        afficherErreur('Erreur lors du téléchargement de la fiche.');
    }
  };




  return (
  
  <div className='container-principal'>
        <div className="ud-pag">
        <button className="ud-retour" onClick={() => navigate('/utilisateurs/personnel')}>
            <i className="fas fa-arrow-left"></i> Retour à la liste
        </button>

        <div className="ud-header-row">
            <div>
            <h1>Détails du personnel</h1>
            <div className="sub">Fiche de renseignements personnels</div>
            </div>
            <div className="ud-header-actions">
            <button className="ud-btn-outline" onClick={imprimerFiche}>
                <i className="fas fa-download"></i> Télécharger le PDF
            </button>
            <button className="ud-btn-fill" onClick={() => navigate(`/utilisateurs/personnel/${id}/modifier`)}>
                <i className="fas fa-pen"></i> Modifier
            </button>
            </div>
        </div>
        
        
        
        <div className="ud-carte-profil">
            {personnel.photo ? (
                <img src={personnel.photo} className="ud-avatar" />
            ) : (
                <div className="ud-avatar ud-avatar-placeholder"><i className="fas fa-user"></i></div>
            )}
            <div className="ud-identite">
                <h2>{personnel.nom} {personnel.prenom}</h2>
                <span className="badge badge-violet"><p className='bull'>&bull;</p> {personnel.poste || 'Personnel'}</span>
                <div className="ud-meta-row">
                    <div className="ud-meta-item"><i className="fas fa-id-badge"></i><span className="label">Matricule</span>{personnel.matricule}</div>
                    <div className="ud-meta-item"><i className="fas fa-calendar"></i><span className="label">Embauché le</span>{new Date(personnel.date_embauche).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="ud-meta-item">
                    <i className="fas fa-shield"></i><span className="label">Statut</span>
                    <span className={`badge ${BADGE_STATUT_PERSONNEL[personnel.statut]}`}>
                        <p className='bull'>&bull;</p>
                        {STATUTS_PERSONNEL.find((s) => s.value === personnel.statut)?.label}
                    </span>
                    </div>
                </div>
            </div>
        </div>
        
        
        <div className="ud-tabs">
            {ONGLETS.map((o) => (
            <button
                key={o.id}
                className={`ud-tab ${ongletActif === o.id ? 'active' : ''}`}
                onClick={() => setOngletActif(o.id)}
            >
                <i className={`fas ${o.icone}`}></i> {o.label}
            </button>
            ))}
        </div>



        {ongletActif === 'tous' && (
            <div className="ud-grid-2">

                <div className="ud-bloc">
                    <div className="ud-bloc-titre">
                    <div className="ud-bloc-icone violet"><i className="fas fa-id-card"></i></div>
                    Informations d'identité
                    </div>
                    <div className="ud-champ-ligne"><span className="cle">Nom complet</span><span className="valeur">{personnel.nom} {personnel.prenom}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Sexe</span><span className="valeur">{personnel.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Date de naissance</span><span className="valeur">{new Date(personnel.date_naissance).toLocaleDateString('fr-FR')}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Matricule</span><span className="valeur mono">{personnel.matricule}</span></div>
                </div>

                <div className="ud-bloc">
                    <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone vert"><i className="fas fa-phone"></i></div>
                        Coordonnées
                    </div>
                    <div className="ud-champ-ligne"><span className="cle">Téléphone</span><span className="valeur">{personnel.telephone || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Email</span><span className="valeur">{personnel.email || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Adresse</span><span className="valeur">{personnel.adresse || '—'}</span></div>
                </div>

                <div className="ud-bloc">
                    <div className="ud-bloc-titre">
                    <div className="ud-bloc-icone bleu"><i className="fas fa-briefcase"></i></div>
                    Informations professionnelles
                    </div>
                    <div className="ud-champ-ligne"><span className="cle">Poste</span><span className="valeur">{personnel.poste || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Fonction</span><span className="valeur">{personnel.fonction || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Salaire</span><span className="valeur">{personnel.salaire ? `${personnel.salaire} FCFA` : '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Date d'embauche</span><span className="valeur">{new Date(personnel.date_embauche).toLocaleDateString('fr-FR')}</span></div>
                </div>

                <div className="ud-bloc">
                    <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone violet"><i className="fas fa-file"></i></div>
                        Documents
                    </div>
                    <div className="ud-champ-ligne">
                        <span className="cle">CNI</span>
                        {personnel.cni ? <a href={personnel.cni} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                    </div>
                    <div className="ud-champ-ligne">
                        <span className="cle">Diplôme</span>
                        {personnel.diplome ? <a href={personnel.diplome} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                    </div>
                    <div className="ud-champ-ligne">
                        <span className="cle">Lettre de motivation</span>
                        {personnel.motivation ? <a href={personnel.motivation} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                    </div>
                    <div className="ud-champ-ligne">
                        <span className="cle">Lettre de recommandation</span>
                        {personnel.recommandation ? <a href={personnel.recommandation} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                    </div>
                </div>

            </div>
        )}



        
        {ongletActif === 'identite' && (
            <div className="ud-grid-2">
                <div className="ud-bloc fill">
                    <div className="ud-bloc-titre">
                    <div className="ud-bloc-icone violet"><i className="fas fa-id-card"></i></div>
                    Informations d'identité
                    </div>
                    <div className="ud-champ-ligne"><span className="cle">Nom complet</span><span className="valeur">{personnel.nom} {personnel.prenom}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Sexe</span><span className="valeur">{personnel.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Date de naissance</span><span className="valeur">{new Date(personnel.date_naissance).toLocaleDateString('fr-FR')}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Matricule</span><span className="valeur mono">{personnel.matricule}</span></div>
                </div>
            </div>
        )}

        {ongletActif === 'coordonnees' && (
            <div className="ud-grid-2">
                <div className="ud-bloc fill">
                    <div className="ud-bloc-titre">
                    <div className="ud-bloc-icone vert"><i className="fas fa-phone"></i></div>
                    Coordonnées
                    </div>
                    <div className="ud-champ-ligne"><span className="cle">Téléphone</span><span className="valeur">{personnel.telephone || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Email</span><span className="valeur">{personnel.email || '—'}</span></div>
                    <div className="ud-champ-ligne"><span className="cle">Adresse</span><span className="valeur">{personnel.adresse || '—'}</span></div>
                </div>
            </div>
        )}
        
        {ongletActif === 'professionnel' && (
            <div className="ud-grid-2">
            <div className="ud-bloc fill">
                <div className="ud-bloc-titre">
                <div className="ud-bloc-icone bleu"><i className="fas fa-briefcase"></i></div>
                Informations professionnelles
                </div>
                <div className="ud-champ-ligne"><span className="cle">Poste</span><span className="valeur">{personnel.poste || '—'}</span></div>
                <div className="ud-champ-ligne"><span className="cle">Fonction</span><span className="valeur">{personnel.fonction || '—'}</span></div>
                <div className="ud-champ-ligne"><span className="cle">Salaire</span><span className="valeur">{personnel.salaire ? `${personnel.salaire} FCFA` : '—'}</span></div>
                <div className="ud-champ-ligne"><span className="cle">Date d'embauche</span><span className="valeur">{new Date(personnel.date_embauche).toLocaleDateString('fr-FR')}</span></div>
            </div>
            </div>
        )}
        
        {ongletActif === 'documents' && (
            <div className="ud-grid-2">
            <div className="ud-bloc fill">
                <div className="ud-bloc-titre">
                    <div className="ud-bloc-icone violet"><i className="fas fa-file"></i></div>
                    Documents
                </div>
                <div className="ud-champ-ligne">
                    <span className="cle">CNI</span>
                    {personnel.cni ? <a href={personnel.cni} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                </div>
                <div className="ud-champ-ligne">
                    <span className="cle">Diplôme</span>
                    {personnel.diplome ? <a href={personnel.diplome} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                </div>
                <div className="ud-champ-ligne">
                    <span className="cle">Lettre de motivation</span>
                    {personnel.motivation ? <a href={personnel.motivation} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                </div>
                <div className="ud-champ-ligne">
                    <span className="cle">Lettre de recommandation</span>
                    {personnel.recommandation ? <a href={personnel.recommandation} target="_blank" rel="noreferrer" className="valeur-lien"><i className="fas fa-eye"></i> Voir le fichier</a> : <span className="valeur">—</span>}
                </div>
            </div>
            </div>
        )}

        </div>

    </div>

  );
  
}


export default PersonnelDetail;