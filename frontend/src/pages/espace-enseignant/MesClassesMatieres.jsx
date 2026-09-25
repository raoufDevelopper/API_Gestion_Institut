import { useState, useEffect } from 'react';
import { getMesClassesMatieres } from '../../api/espaceEnseignant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';





function MesClassesMatieres() {

  const [donnees, setDonnees] = useState(null);

  useEffect(() => { getMesClassesMatieres().then((res) => setDonnees(res.data)); }, []);

  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;



  return (
    <div className="container-principal">

      <div className="department-page">
      
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mes classes & matières</h3>
            <div className="sub">{donnees.length} combinaison(s) enseignée(s) cette année</div>
          </div>
        </div>




        {/* KPI */}
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        
          {donnees.map((c, i) => 
            <div className="department-card">
              <div className="count-top">
                <span id='nom-matiere'>{c.matiere_nom}</span>
                <span id='nom-classe'>{c.classe_str}</span>
                <span id='effectif-classe'>
                  <i className="fas fa-user-graduate"></i>
                  {c.effectif} étudiants
                </span>
              </div>
            </div>
          )}

          {donnees.length === 0 && <tr><td colSpan="3"><div className="empty">Aucune affectation pour l'année en cours.</div></td></tr>}

        </div>

      </div>

    </div>
  );

}


export default MesClassesMatieres;