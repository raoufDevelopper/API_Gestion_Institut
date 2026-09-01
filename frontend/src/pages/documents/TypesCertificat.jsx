
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getTypesCertificat, creerTypeCertificat, modifierTypeCertificat, supprimerTypeCertificat } from '../../api/documents';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';
function TypesCertificat() {
  const [types, setTypes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [typeEnEdition, setTypeEnEdition] = useState(null);
  const [typeASupprimer, setTypeASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getTypesCertificat();
    setTypes(res.data.resultats || res.data);
  };
  useEffect(() => { charger(); }, []);
  const typesFiltres = types.filter((t) => (t.code + ' ' + t.nom).toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => {
    setTypeEnEdition(null);
    reset({ code: '', nom: '', auto_generable: false });
    setModalOuvert(true);
  };
  const ouvrirEdition = (t) => {
    setTypeEnEdition(t.id);
    reset({ code: t.code, nom: t.nom, auto_generable: t.auto_generable });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (typeEnEdition) {
        await modifierTypeCertificat(typeEnEdition, data);
        afficherSucces('Type de certificat modifié avec succès.');
      } else {
        await creerTypeCertificat(data);
        afficherSucces('Type de certificat créé avec succès.');
      }
      reset();
      setModalOuvert(false);
      setTypeEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(err.response?.data?.code?.[0] || "Erreur lors de l'enregistrement.");
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerTypeCertificat(typeASupprimer.id);
      afficherSucces('Type de certificat supprimé.');
      setTypeASupprimer(null);
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
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Types de certificats</h3>
            <div className="sub">{types.length} type(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i> Ajouter un type
          </button>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un type de certificat..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des types de certificats</h2>
            <span>{typesFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Code</th>
                  <th>Générable automatiquement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {typesFiltres.map((t) => (
                  <tr className="row-link" key={t.id}>
                    <td className="cell-strong">{t.nom}</td>
                    <td className="mono">{t.code}</td>
                    <td>
                      <span className={`badge ${t.auto_generable ? 'badge-success' : 'badge-danger'}`}>
                        <span className="dot"></span>
                        {t.auto_generable ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn edit" onClick={() => ouvrirEdition(t)}>
                        <i className="fas fa-pen"></i>
                      </button>
                      <button className="table-btn delete" onClick={() => setTypeASupprimer(t)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {typesFiltres.length === 0 && (
                  <tr><td colSpan="4"><div className="empty">Aucun type de certificat ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{typeEnEdition ? 'Modifier le type de certificat' : 'Nouveau type de certificat'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Code</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: scolarite" {...register('code', { required: 'Le code est requis' })} />
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: Certificat de scolarité" {...register('nom', { required: 'Le nom est requis' })} />
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>

              <div className="form-group">
                <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "15px 0 5px 0", borderTop: "solid 1px var(--input)" }}>
                  <span style={{ marginRight: "10px" }}>Générable automatiquement</span>
                  <label className="switch">
                    <input type="checkbox" {...register('auto_generable')} style={{ width: "44px" }}/>
                    <span className="slider"></span>
                  </label>
                </label>
              </div>

            </div>
            <div className="modal-footer">
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
          <hr />
          <p id="consigne">Le remplissage des champs marqués avec (*) est obligatoire.</p>
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!typeASupprimer}
        titre="Supprimer le type de certificat"
        message={`Voulez-vous vraiment supprimer « ${typeASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setTypeASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default TypesCertificat;