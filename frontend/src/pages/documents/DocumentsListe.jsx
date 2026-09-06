
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getDocuments, creerDocument, modifierDocument, supprimerDocument } from '../../api/documents';
import { getEtudiants, getPersonnels } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import Pagination from '../../components/Pagination';
import '../../assets/css/crud.css';


const PAR_PAGE = 10;


function DocumentsListe() {
  const [documents, setDocuments] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [filtreConcerne, setFiltreConcerne] = useState('');
  const [page, setPage] = useState(1);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [documentEnEdition, setDocumentEnEdition] = useState(null);
  const [documentASupprimer, setDocumentASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors } } = useForm();
  const concerneType = watch('concerne_type');

  const charger = async () => {
    const res = await getDocuments();
    setDocuments(res.data);
  };

  useEffect(() => {
    charger();
    getEtudiants().then((res) => setEtudiants(res.data.filter((e) => e.statut === 'ACTIF')));
    getPersonnels().then((res) => setPersonnels(res.data.filter((p) => p.statut === 'ACTIF')));
  }, []);
  
  const categories = Array.from(new Set(documents.map((d) => d.categorie).filter(Boolean)));
  
  const filtres = documents.filter((d) => {
    const texte = (d.titre + ' ' + (d.categorie || '')).toLowerCase();
    const matchRecherche = texte.includes(recherche.toLowerCase());
    const matchCategorie = !filtreCategorie || d.categorie === filtreCategorie;
    const matchConcerne = !filtreConcerne
      || (filtreConcerne === 'etudiant' && d.concerne_etudiant)
      || (filtreConcerne === 'personnel' && d.concerne_personnel);
    return matchRecherche && matchCategorie && matchConcerne;
  });
  
  const totalPages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE));
  
  const pageActuelle = filtres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  
  const ouvrirCreation = () => {
    setDocumentEnEdition(null);
    reset({ titre: '', categorie: '', concerne_type: '', concerne_etudiant: '', concerne_personnel: '' });
    setModalOuvert(true);
  };
  
  const ouvrirEdition = (d) => {
    setDocumentEnEdition(d.id);
    reset({
      titre: d.titre, categorie: d.categorie,
      concerne_type: d.concerne_etudiant ? 'etudiant' : d.concerne_personnel ? 'personnel' : '',
      concerne_etudiant: d.concerne_etudiant || '',
      concerne_personnel: d.concerne_personnel || '',
    });
    setModalOuvert(true);
  };
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('titre', data.titre);
    if (data.categorie) formData.append('categorie', data.categorie);
    if (data.concerne_type === 'etudiant' && data.concerne_etudiant) formData.append('concerne_etudiant', data.concerne_etudiant);
    if (data.concerne_type === 'personnel' && data.concerne_personnel) formData.append('concerne_personnel', data.concerne_personnel);
    if (data.fichier instanceof FileList && data.fichier.length > 0) formData.append('fichier', data.fichier[0]);
    try {
      if (documentEnEdition) {
        await modifierDocument(documentEnEdition, formData);
        afficherSucces('Document modifié avec succès.');
      } else {
        await creerDocument(formData);
        afficherSucces('Document ajouté avec succès.');
      }
      reset();
      setModalOuvert(false);
      setDocumentEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.fichier?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerDocument(documentASupprimer.id);
      afficherSucces('Document supprimé.');
      setDocumentASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Documents</h3>
            <div className="sub">Gestion documentaire — Autres documents</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i> Ajouter un document
          </button>
        </div>
      
        <div className="department-toolbar">

          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher un document..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}/>
            </div>
          </div>
        
          <div className="toolbar-right">
            <select className="filter-select" value={filtreCategorie} onChange={(e) => { setFiltreCategorie(e.target.value); setPage(1); }}>
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="toolbar-right">  
            <select className="filter-select" value={filtreConcerne} onChange={(e) => { setFiltreConcerne(e.target.value); setPage(1); }}>
              <option value="">Concerne — tous</option>
              <option value="etudiant">Étudiant</option>
              <option value="personnel">Personnel</option>
            </select>
          </div>

        </div>
      
      
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des documents</h2>
            <span>{filtres.length} document(s)</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Concerne</th>
                  <th>Ajouté par</th>
                  <th>Date d'ajout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageActuelle.map((d) => (
                  <tr className="row-link" key={d.id}>
                    <td className="cell-strong">{d.titre}</td>
                    <td>{d.categorie || '—'}</td>
                    <td>{d.concerne_str || '—'}</td>
                    <td>{d.ajoute_par_nom || '—'}</td>
                    <td>{new Date(d.date_ajout).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button className="table-btn view" onClick={() => navigate(`/documents/documents/${d.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(d)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setDocumentASupprimer(d)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {pageActuelle.length === 0 && (
                  <tr><td colSpan="6"><div className="empty">Aucun document trouvé.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>




      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{documentEnEdition ? 'Modifier le document' : 'Ajouter un document'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm" encType="multipart/form-data">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Titre</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" {...register('titre', { required: true })} />
                {errors.titre && <div className="form-errors">Champ requis</div>}
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <input type="text" placeholder="Ex: Convention, Contrat, Rapport..." {...register('categorie')} />
              </div>
              <div className="form-group">
                <label>Concerne</label>
                <select {...register('concerne_type')}>
                  <option value="">Aucun</option>
                  <option value="etudiant">Un étudiant</option>
                  <option value="personnel">Un membre du personnel</option>
                </select>
              </div>
              {concerneType === 'etudiant' && (
                <div className="form-group">
                  <label>Étudiant</label>
                  <select {...register('concerne_etudiant')}>
                    <option value="">Sélectionner...</option>
                    {etudiants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
              )}
              {concerneType === 'personnel' && (
                <div className="form-group">
                  <label>Personnel</label>
                  <select {...register('concerne_personnel')}>
                    <option value="">Sélectionner...</option>
                    {personnels.map((p) => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group full">
                <div><label>Fichier</label>{!documentEnEdition && <span className="required" style={{ color: 'red' }}>*</span>}</div>
                <input type="file" {...register('fichier', { required: !documentEnEdition })} />
                {documentEnEdition && <div className="cell-sub">Laisser vide pour conserver le fichier actuel.</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>



      <ConfirmationModal
        ouvert={!!documentASupprimer}
        titre="Supprimer le document"
        message={`Voulez-vous vraiment supprimer « ${documentASupprimer?.titre} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setDocumentASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default DocumentsListe;