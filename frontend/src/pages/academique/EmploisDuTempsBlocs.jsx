import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmploisDuTemps, telechargerEmploiDuTempsPdf } from '../../api/emploisDuTemps';
import { useAlert } from '../../context/AlertContext';
import { STATUTS_EMPLOI, CLASSE_BADGE_STATUT } from './emploiDuTempsConstantes';
import '../../assets/css/emploiDuTemps.css';




function labelSemaine(e) {
  if (!e.semaine_debut) return 'Semaine non définie';
  const debut = new Date(e.semaine_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const fin = e.semaine_fin ? new Date(e.semaine_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  return `Semaine du ${debut}${fin ? ' au ' + fin : ''}`;
}



function EmploisDuTempsBlocs() {
  const [emplois, setEmplois] = useState([]);
  const [recherche, setRecherche] = useState('');
  const { afficherErreur } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    getEmploisDuTemps().then((res) => setEmplois(res.data.resultats));
  }, []);
  
  const emploisFiltres = emplois.filter((e) => {
    const texte = (
      e.nom_affiche + ' ' + e.classe_str + ' ' + e.semestre + ' ' +
      (e.annee_academique_libelle || '') + ' ' + e.statut
    ).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  
  const groupes = useMemo(() => {
    const parAnnee = {};
    emploisFiltres.forEach((e) => {
      const annee = e.annee_academique_libelle || 'Sans année académique';
      const semestre = e.semestre || '—';
      const semaine = labelSemaine(e);
      parAnnee[annee] = parAnnee[annee] || {};
      parAnnee[annee][semestre] = parAnnee[annee][semestre] || {};
      parAnnee[annee][semestre][semaine] = parAnnee[annee][semestre][semaine] || [];
      parAnnee[annee][semestre][semaine].push(e);
    });
    return parAnnee;
  }, [emploisFiltres]);
  
  const telechargerPdf = async (emploi) => {
    try {
      const res = await telechargerEmploiDuTempsPdf(emploi.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emploi_du_temps_${emploi.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement du PDF.');
    }
  };

  


  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="retour-link" style={{ marginBottom: "-10px" }}>
          <div>
            <button onClick={() => navigate('/academique/emplois-du-temps')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Retour aux sessions
            </button>
            <span> - Détail sur la caisse</span>
          </div>
        </div>

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Aperçu des emplois du temps</h3>
            <div className="sub">
              Recherchez et consuletez un ou une liste d'emplois du temps
            </div>
          </div>
        </div>
  

        {/* TOOLBAR */}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher (classe, semestre, année, statut...)" value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
            </div>
          </div>
        </div>
      
       
        {Object.keys(groupes).length === 0 && (
          <div className="empty" style={{ marginTop: '30px' }}>
            Aucun résultat.
          </div>
        )}
       

        {Object.entries(groupes).map(([annee, semestres]) => (
          <div className="edt-groupe-annee" key={annee}>

            <h2 className="badge badge-violet anneeAca">
              <i className="fas fa-calendar"></i> {annee}
            </h2>
            
            {Object.entries(semestres).map(([semestre, semaines]) => (
              <div className="edt-groupe-semestre" key={semestre}>
                
                <h3 className="badge badge-orange anneeAca">
                  Liste des emplois du temps du 
                  {semestre === 'S1' ? ' Semestre 1' : semestre === 'S2' ? ' Semestre 2' : semestre}
                </h3>
                

                {Object.entries(semaines).map(([semaine, listeEmplois]) => (
                  <div className="edt-groupe-semaine" key={semaine}>
                
                    <h4 className="badge badge-aqua anneeAca">
                      {semaine}
                    </h4>
                
                    <div className="edt-cartes-grid">
                      
                      {listeEmplois.map((e) => (
                        <div className="edt-carte" key={e.id} onClick={() => navigate(`/academique/emplois-du-temps/${e.id}`)}>
                          
                          <div className="edt-carte-header">
                            <span className={`${CLASSE_BADGE_STATUT[e.statut]}`}>
                              <p className='bull'>&bull;</p>
                              {STATUTS_EMPLOI.find((s) => s.value === e.statut)?.label}
                            </span>
                          </div>

                          <div className="edt-carte-classe">{e.classe_str}</div>
                          
                          <div className="edt-carte-titre">{e.nom_affiche}</div>
                          
                          <div className="edt-carte-footer">
                            <span className="edt-carte-seances">
                              <i className="fas fa-list-check"></i> {e.nb_seances} séance{e.nb_seances > 1 ? 's' : ''}
                            </span>
                            <button className="edt-btn-pdf" onClick={(evt) => { evt.stopPropagation(); telechargerPdf(e); }} title="Télécharger le PDF">
                              <i className="fas fa-file-pdf"></i>
                            </button>
                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                ))}

              </div>

            ))}

          </div>

        ))}


      </div>
    </div>
  );
}
export default EmploisDuTempsBlocs;