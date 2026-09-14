import { useState, useEffect } from 'react';
import { getDocumentsEtudiant } from '../../api/espaceEtudiant';
import Loader from '../../components/Loader';
import '../../assets/css/crud.css';



function DocumentsEtudiant() {
  const [documents, setDocuments] = useState(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => { getDocumentsEtudiant().then((res) => setDocuments(res.data)); }, []);

  if (!documents) return <div className="container-principal"><Loader label="Chargement..." /></div>;

  const filtres = documents.filter((d) => d.titre.toLowerCase().includes(recherche.toLowerCase()));


  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head"><div><h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Mes documents</h3><div className="sub">Téléchargez vos documents administratifs et académiques</div></div></div>

        <div className="department-toolbar">
          <div className="toolbar-left"><div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder="Rechercher un document..." value={recherche} onChange={(e) => setRecherche(e.target.value)} /></div></div>
        </div>


        <div className="department-card table-card">

          <div className="table-title">
            <h2>Documents</h2>
            <span>{filtres.length} Documents</span>
          </div>

          <div className="table-scroll">
            <table>

              <thead>
                <tr>
                  <th>Document</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th style={{ minWidth: '100px' }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtres.map((d, i) => (
                  <tr key={i}>
                    <td className="cell-strong">{d.titre}</td>
                    <td>{d.categorie}</td>
                    <td>{new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>
                      <span className="badge badge-success">
                        <p className='bull'>&bull;</p>
                        Disponible
                      </span>
                    </td>
                    <td>
                      {d.fichier && 
                        <a href={d.fichier} target="_blank" rel="noreferrer">
                          <button className="table-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                        </a>
                      }
                    </td>
                  </tr>
                ))}
                {filtres.length === 0 && <tr><td colSpan="5"><div className="empty">Aucun document.</div></td></tr>}
              </tbody>

            </table>


          </div>
        </div>
      </div>
    </div>
  );
}
export default DocumentsEtudiant;