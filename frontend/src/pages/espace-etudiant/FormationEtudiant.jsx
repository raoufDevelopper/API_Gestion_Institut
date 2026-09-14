
import { useState, useEffect } from 'react';
import { getFormationEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';



function FormationEtudiant() {

  const [donnees, setDonnees] = useState(null);

  useEffect(() => { getFormationEtudiant().then((res) => setDonnees(res.data)); }, []);

  if (!donnees) return <div className="container-principal"><Loader label="Chargement..." /></div>;



  return (
    <div className="container-principal">

      <div className="department-page">

        <div className="panel-head"><div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Ma formation</h3><div className="sub">Découvrez les informations sur votre parcours et vos matières</div></div></div>

        <div className="dl-group" style={{ marginBottom: '20px' }}>
          <div className="dl-row"><span className="dl-k">Filière</span><span className="dl-v">{donnees.filiere}</span></div>
          <div className="dl-row"><span className="dl-k">Spécialité</span><span className="dl-v">{donnees.specialite}</span></div>
          <div className="dl-row"><span className="dl-k">Classe</span><span className="dl-v">{donnees.classe}</span></div>
          <div className="dl-row"><span className="dl-k">Niveau</span><span className="dl-v">{donnees.niveau}</span></div>
        </div>

        <div className="department-card table-card">
          <div className="table-title">
            <h2>Matières de la formation</h2>
            <span>{donnees.matieres.length} Matières</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Matière</th>
                  <th>Enseignant</th>
                  <th>Coef</th>
                  <th>Vol.horaire</th>
                </tr>
              </thead>
              <tbody>
                {donnees.matieres.map((m, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{m.matiere}</td>
                    <td>{m.enseignant}</td>
                    <td>{m.coefficient} crédits</td>
                    <td>{m.volume_horaire} heures</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>

  );

}



export default FormationEtudiant;
