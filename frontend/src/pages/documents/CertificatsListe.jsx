
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCertificats, telechargerCertificat, supprimerCertificat, getTypesCertificat } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { telechargerFichier } from './documentsConstantes';
import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';

const PAR_PAGE = 10;

function CertificatsListe() {
  const [certificats, setCertificats] = useState([]);
  const [types, setTypes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [page, setPage] = useState(1);
  const [certificatEnDetail, setCertificatEnDetail] = useState(null);
  const [certificatASupprimer, setCertificatASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  
  const charger = async () => {
    const res = await getCertificats();
    setCertificats(res.data);
  };


  useEffect(() => {
    charger();
    getTypesCertificat().then((res) => setTypes(res.data.resultats || res.data));
  }, []);

  const annees = useMemo(() => {
    const set = new Set(certificats.map((c) => new Date(c.date_emission).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [certificats]);

  const filtres = certificats.filter((c) => {
    const texte = (c.numero + ' ' + c.etudiant_str).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchType = !filtreType || String(c.type_certificat) === filtreType;
    const matchAnnee = !filtreAnnee || String(new Date(c.date_emission).getFullYear()) === filtreAnnee;
    return matchRecherche && matchType && matchAnnee;
  });


  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));

  const pageActuelle = filtres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  const telecharger = async (c) => {
    try {
      const res = await telechargerCertificat(c.id);
      telechargerFichier(res.data, `certificat_${c.numero}.pdf`);
    } catch (err) {
      afficherErreur('Erreur lors du téléchargement.');
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerCertificat(certificatASupprimer.id);
      afficherSucces('Certificat supprimé.');
      setCertificatASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Certificats</h3>
            <div className="sub">Gestion documentaire — Certificats</div>
          </div>
          <button className="btn-primary addInscr" onClick={() => navigate('/documents/certificats/generer')}>
            <i className="fas fa-plus"></i> Générer un certificat
          </button>
        </div>


        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher par numéro ou étudiant..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}/>
            </div>
          </div>

          <div className="toolbar-right">
            <select className="filter-select" value={filtreType} onChange={(e) => { setFiltreType(e.target.value); setPage(1); }}>
              <option value="">Tous les types</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>

          <div className="toolbar-right">
            <select className="filter-select" value={filtreAnnee} onChange={(e) => { setFiltreAnnee(e.target.value); setPage(1); }}>
              <option value="">Toutes les années</option>
              {annees.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>



        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des certificats</h2>
            <span>{filtres.length} certificat(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>N° Certificat</th>
                  <th>Type</th>
                  <th>Étudiant</th>
                  <th>Date d'émission</th>
                  <th>Généré par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((c) => (
                  <tr className="row-link" key={c.id}>
                    <td className="cell-strong mono">{c.numero}</td>
                    <td>{c.type_certificat_nom}</td>
                    <td>{c.etudiant_str}</td>
                    <td>{new Date(c.date_emission).toLocaleDateString('fr-FR')}</td>
                    <td>{c.genere_par_nom || '—'}</td>
                    <td>
                      <button className="table-btn view" onClick={() => setCertificatEnDetail(c)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn download" onClick={() => telecharger(c)}>
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setCertificatASupprimer(c)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && (
                  <tr><td colSpan="6"><div className="empty">Aucun certificat ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />

        </div>

      </div>



      <div className="department-modal" style={{ display: certificatEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
            <h2>Détail du certificat</h2>
            <button onClick={() => setCertificatEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {certificatEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>N° Certificat</label><p className="mono">{certificatEnDetail.numero}</p></div>
              <div className="form-group"><label>Type</label><p>{certificatEnDetail.type_certificat_nom}</p></div>
              <div className="form-group"><label>Étudiant</label><p>{certificatEnDetail.etudiant_str}</p></div>
              <div className="form-group"><label>Date d'émission</label><p>{new Date(certificatEnDetail.date_emission).toLocaleDateString('fr-FR')}</p></div>
              <div className="form-group"><label>Généré par</label><p>{certificatEnDetail.genere_par_nom || '—'}</p></div>
            </div>
          )}
        </div>
      </div>


      <ConfirmationModal
        ouvert={!!certificatASupprimer}
        titre="Supprimer le certificat"
        message={`Voulez-vous vraiment supprimer le certificat « ${certificatASupprimer?.numero} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setCertificatASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>

  );

}

export default CertificatsListe;