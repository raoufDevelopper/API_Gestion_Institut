import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesEtudiants, getMesClassesMatieres } from '../../api/espaceEnseignant';

import { useAffichage } from '../../context/AffichageContext';

import Loader from '../../components/Loader';
import ToggleVue from '../../components/ToggleVue';
import '../../assets/css/crud.css';
import '../../assets/css/saisieNotes.css';


function MesEtudiants() {

  const navigate = useNavigate();


  const { modeAffichage: vue } = useAffichage();


  const [etudiants, setEtudiants] = useState(null);

  const [matieres, setMatieres] = useState([]);

  const [filtreMatiere, setFiltreMatiere] = useState('');

  const [recherche, setRecherche] = useState('');


  useEffect(() => { getMesClassesMatieres().then((res) => setMatieres([...new Map(res.data.map((c) => [c.matiere_id, { id: c.matiere_id, nom: c.matiere_nom }])).values()])); }, []);

  useEffect(() => { getMesEtudiants({ matiere: filtreMatiere || undefined }).then((res) => setEtudiants(res.data)); }, [filtreMatiere]);


  if (!etudiants) return <div className="container-principal"><Loader label="Chargement..." /></div>;

  const filtres = etudiants.filter((e) => (e.nom + e.prenom + e.matricule).toLowerCase().includes(recherche.toLowerCase()));




  return (
    <div className="container-principal">

      <div className="department-page">
      
        <div className="panel-head"><div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mes étudiants</h3><div className="sub">{filtres.length} étudiant(s)</div></div></div>
        
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </div>
          </div>

          <div className="toolbar-right">
            <select className="filter-select" value={filtreMatiere} onChange={(e) => setFiltreMatiere(e.target.value)}>
              <option value="">Toutes mes matières</option>
              {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
          </div>
        </div>
      
      
      
      
        {vue === 'tableau' ? (
           
          <div className="department-card table-card">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Classe</th>
                    <th>Matière</th>
                    <th style={{ minWidth: '100px' }}>Sémestre 1</th>
                    <th style={{ minWidth: '100px' }}>Sémestre 2</th>
                    <th style={{ minWidth: '100px' }}>Moyenne</th>
                    <th style={{ minWidth: '100px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtres.map((e, i) => (
                    <tr key={i} onClick={() => navigate(`/espace-enseignant/etudiants/${e.etudiant_id}?matiere=`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="cell-with-avatar">
                          {e.photo ? <img src={e.photo} alt={e.nom} className="avatar-mini" /> : <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>}
                          <div>
                            <div className="cell-strong" style={{ marginBottom: '5px' }}>{e.nom} {e.prenom}</div>
                            <div className="mono">{e.matricule}</div>
                          </div>
                        </div>
                      </td>
                      <td>{e.classe}</td>
                      <td>{e.matiere}</td>
                      <td>
                        <span className={`badge-${e.moyenne_s1 > 10 ? 'success' : 'danger'}`}>
                          <p className='bull'>&bull;</p>
                          {e.moyenne_s1 ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-${e.moyenne_s2 > 10 ? 'success' : 'danger'}`}>
                          <p className='bull'>&bull;</p>
                          {e.moyenne_s2 ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-${e.moyenne_annee > 10 ? 'success' : 'danger'}`}>
                          <p className='bull'>&bull;</p>
                          {e.moyenne_annee ?? '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          <p className='bull'>&bull;</p>{e.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : (

          <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))' }}>
            {filtres.map((e, i) => (
              <div class="card-perso" key={i} onClick={() => navigate(`/espace-enseignant/etudiants/${e.etudiant_id}?matiere=`)} style={{ cursor: 'pointer' }}>
                <div class="card-img">
                  {e.photo ? <img src={e.photo} alt={e.nom} className="avatar-mini" /> : <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>}
                </div>
                <div class="card-content-perso">
                  <h3>{e.nom} {e.prenom}</h3>
                  <p>{e.matricule} ---- {e.classe}</p>
                  <span className='badge-success'>
                    <i className="fas fa-circle-check"></i> 
                    Étudiant actif
                  </span>
                </div>
              </div>
            ))}
          </div>
          
        )}

      </div>
    </div>
  );
}

export default MesEtudiants;



