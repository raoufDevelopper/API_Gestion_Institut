
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEtudiant } from '../../api/utilisateurs';
import { telechargerFicheEtudiant } from '../../api/utilisateurs';
import { telechargerFichier } from '../finances/financesConstantes'; // réutilise l'utilitaire déjà existant
import { STATUTS_ETUDIANT, BADGE_STATUT_ETUDIANT } from './utilisateursConstantes';
import '../../assets/css/detailUtilisateur.css';

const ONGLETS = [
  { id: 'tous', label: 'Tous'},
  { id: 'identite', label: 'Informations d\'identité', icone: 'fa-address-card' },
  { id: 'coordonnees', label: 'Coordonnées', icone: 'fa-phone' },
  { id: 'urgence', label: 'Contact d\'urgence', icone: 'fa-user-shield' },
  { id: 'academique', label: 'Informations académiques', icone: 'fa-graduation-cap' },
  { id: 'documents', label: 'Documents', icone: 'fa-file' },
];

function EtudiantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [etudiant, setEtudiant] = useState(null);
  const [ongletActif, setOngletActif] = useState('tous');
  useEffect(() => {
    getEtudiant(id).then((res) => setEtudiant(res.data));
  }, [id]);
  if (!etudiant) {
    return <div className="ud-page"><div className="empty">Chargement...</div></div>;
  }

  const imprimerFiche = async () => {
    try {
        const res = await telechargerFicheEtudiant(id);
        telechargerFichier(res.data, `fiche_etudiant_${etudiant.matricule}.pdf`);
    } catch (err) {
        afficherErreur('Erreur lors du téléchargement de la fiche.');
    }
  };


  return (

    <div className='container-principal'>
        
        <div className="ud-pag">
        
        
            <div className="fi-header" style={{ marginBottom: "10px" }}>
              <div>
                <button className="ud-retour" onClick={() => navigate('/utilisateurs/etudiants')}>
                  <i className="fas fa-arrow-left"></i> 
                  Retour à la liste 
                </button>
                <span> - Modifier l'étudiant</span>
              </div>
            </div>
        
        
            <div className="ud-header-row">
                <div>
                    <h1>Détails de l'étudiant</h1>
                    <div className="sub">Fiche de renseignements personnels</div>
                </div>
                <div className="ud-header-actions">
                    <button className="ud-btn-outline" onClick={imprimerFiche}>
                        <i className="fas fa-download"></i> Télécharger le PDF
                    </button>
                    <button className="ud-btn-fill" onClick={() => navigate(`/utilisateurs/etudiants/${id}/modifier`)}>
                        <i className="fas fa-pen"></i> Modifier
                    </button>
                </div>
            </div>
        
        


            <div className="ud-carte-profil">
                
                <div className='carte-profil'>

                    {etudiant.photo ? (
                        <img src={`${etudiant.photo}`} className="ud-avatar" />
                    ) : (
                        <div className="ud-avatar ud-avatar-placeholder"><i className="fas fa-user"></i></div>
                    )}
                
                    <div className="ud-identite">
                        
                        <h2>{etudiant.nom} {etudiant.prenom}</h2>
                        
                        <div className="ud-meta-item">
                            <span className={`badge ${BADGE_STATUT_ETUDIANT[etudiant.statut]}`}> 
                                {STATUTS_ETUDIANT.find((s) => s.value === etudiant.statut)?.label}
                            </span>
                        </div>
                        
                        <div className="ud-meta-row">
                            <div className="ud-meta-item">
                                <i className="fas fa-id-badge"></i>
                                <span className="label">Matricule</span>
                                {etudiant.matricule}
                            </div>
                            <div className="ud-meta-item">
                                <i className="fas fa-calendar"></i>
                                <span className="label">Inscrit le</span>
                                {new Date(etudiant.date_inscription).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                        </div>

                    </div>

                </div>


                <div className='carte-statut'>

                    <div className="ud-meta-item ud-citation badge-aqua">
                        L'éducation est l'arme la plus puissante que l'on puisse 
                        utiliser pour changer le monde. 
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
                        <div className="ud-champ-ligne"><span className="cle">Nom complet</span><span className="valeur">{etudiant.nom} {etudiant.prenom}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Sexe</span><span className="valeur">{etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Date de naissance</span><span className="valeur">{new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Matricule</span><span className="valeur mono">{etudiant.matricule}</span></div>
                    </div>

                    <div className="ud-bloc">
                        <div className="ud-bloc-titre">
                            <div className="ud-bloc-icone vert"><i className="fas fa-phone"></i></div>
                            Coordonnées
                        </div>
                        <div className="ud-champ-ligne"><span className="cle">Téléphone</span><span className="valeur">{etudiant.telephone || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Email</span><span className="valeur">{etudiant.email || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Adresse</span><span className="valeur">{etudiant.adresse || '—'}</span></div>
                    </div>

                    <div className="ud-bloc">
                        <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone orange"><i className="fas fa-user-shield"></i></div>
                        Contact d'urgence
                        </div>
                        <div className="ud-champ-ligne"><span className="cle">Nom du tuteur</span><span className="valeur">{etudiant.nom_tuteur || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Téléphone du tuteur</span><span className="valeur">{etudiant.telephone_tuteur || '—'}</span></div>
                    </div>

                    <div className="ud-bloc">
                        <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone bleu"><i className="fas fa-graduation-cap"></i></div>
                        Informations académiques
                        </div>
                        <div className="ud-champ-ligne"><span className="cle">Spécialité</span><span className="valeur">{etudiant.specialite_code || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Niveau</span><span className="valeur">{etudiant.niveau_nom || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Classe</span><span className="valeur">{etudiant.classe_str || '—'}</span></div>
                    </div>

                    <div className="ud-bloc fill">
                        <div className="ud-bloc-titre">
                            <div className="ud-bloc-icone violet">
                                <i className="fas fa-file"></i>
                            </div>
                            Documents
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">CNI</span>
                            {etudiant.cni ? <a href={etudiant.cni} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">Diplôme</span>
                            {etudiant.diplome ? <a href={etudiant.diplome} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">Acte de naissance</span>
                            {etudiant.acte_naissance ? <a href={etudiant.acte_naissance} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
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
                        <div className="ud-champ-ligne"><span className="cle">Nom complet</span><span className="valeur">{etudiant.nom} {etudiant.prenom}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Sexe</span><span className="valeur">{etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Date de naissance</span><span className="valeur">{new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Matricule</span><span className="valeur mono">{etudiant.matricule}</span></div>
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
                        <div className="ud-champ-ligne"><span className="cle">Téléphone</span><span className="valeur">{etudiant.telephone || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Email</span><span className="valeur">{etudiant.email || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Adresse</span><span className="valeur">{etudiant.adresse || '—'}</span></div>
                    </div>
                </div>
            )}
            
            
            {ongletActif === 'urgence' && (
                <div className="ud-grid-2">
                    <div className="ud-bloc fill">
                        <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone orange"><i className="fas fa-user-shield"></i></div>
                        Contact d'urgence
                        </div>
                        <div className="ud-champ-ligne"><span className="cle">Nom du tuteur</span><span className="valeur">{etudiant.nom_tuteur || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Téléphone du tuteur</span><span className="valeur">{etudiant.telephone_tuteur || '—'}</span></div>
                    </div>
                </div>
            )}
            
            
            {ongletActif === 'academique' && (
                <div className="ud-grid-2">
                    <div className="ud-bloc fill">
                        <div className="ud-bloc-titre">
                        <div className="ud-bloc-icone bleu"><i className="fas fa-graduation-cap"></i></div>
                        Informations académiques
                        </div>
                        <div className="ud-champ-ligne"><span className="cle">Spécialité</span><span className="valeur">{etudiant.specialite_code || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Niveau</span><span className="valeur">{etudiant.niveau_nom || '—'}</span></div>
                        <div className="ud-champ-ligne"><span className="cle">Classe</span><span className="valeur">{etudiant.classe_str || '—'}</span></div>
                    </div>
                </div>
            )}
            
            
            {ongletActif === 'documents' && (
                <div className="ud-grid-2">
                    <div className="ud-bloc fill">
                        <div className="ud-bloc-titre">
                            <div className="ud-bloc-icone violet">
                                <i className="fas fa-file"></i>
                            </div>
                            Documents
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">CNI</span>
                            {etudiant.cni ? <a href={etudiant.cni} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">Diplôme</span>
                            {etudiant.diplome ? <a href={etudiant.diplome} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
                        </div>
                        <div className="ud-champ-ligne">
                            <span className="cle">Acte de naissance</span>
                            {etudiant.acte_naissance ? <a href={etudiant.acte_naissance} target="_blank" rel="noreferrer" className="valeur">Voir le fichier</a> : <span className="valeur">—</span>}
                        </div>
                    </div>
                </div>
            )}


        </div>

    </div>

  );

}

export default EtudiantDetail;