
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getTypesPaiement, creerTypePaiement, modifierTypePaiement, supprimerTypePaiement } from '../../api/finances';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';



function TypesPaiement() {
  const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  const [recherche, setRecherche] = useState('');
  const [modalOuvert, setModalOuvert] = useState(false);
  const [typeEnEdition, setTypeEnEdition] = useState(null);
  const [typeASupprimer, setTypeASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [typeEnDetail, setTypeEnDetail] = useState(null);
  const { afficherSucces, afficherErreur } = useAlert();
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();
  const charger = async () => {
    const res = await getTypesPaiement();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const typesFiltres = donnees.resultats.filter((t) => (t.code + ' ' + t.nom).toLowerCase().includes(recherche.toLowerCase()));
  const ouvrirCreation = () => {
    setTypeEnEdition(null);
    reset({ code: '', nom: '', obligatoire_a_inscription: false, ordre: 0 });
    setModalOuvert(true);
  };
  const ouvrirEdition = (t) => {
    setTypeEnEdition(t.id);
    reset({ code: t.code, nom: t.nom, obligatoire_a_inscription: t.obligatoire_a_inscription, ordre: t.ordre });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (typeEnEdition) {
        await modifierTypePaiement(typeEnEdition, data);
        afficherSucces('Type de paiement modifié avec succès.');
      } else {
        await creerTypePaiement(data);
        afficherSucces('Type de paiement créé avec succès.');
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
      await supprimerTypePaiement(typeASupprimer.id);
      afficherSucces('Type de paiement supprimé.');
      setTypeASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };
  const { total = 0, obligatoire = 0, optionnel = 0 } = donnees.kpis;



  return (
    <div className="container-principal">
      <div className="department-page">
        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Types de paiement</h3>
            <div className="sub">{total} type(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouveau type
          </button>
        </div>
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-money-check-dollar"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-lock"></i></div>
            <div className="count-top"><h2>{obligatoire}</h2><span>Obligatoires</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-lock-open"></i></div>
            <div className="count-top"><h2>{optionnel}</h2><span>Optionnels</span></div>
          </div>
        </div>
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un type de paiement..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des types de paiement</h2>
            <span>{typesFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Obligatoire à l'inscription</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {typesFiltres.map((t) => (
                  <tr className="row-link" key={t.id}>
                    <td><div className="cell-strong mono">{t.code}</div></td>
                    <td>{t.nom}</td>
                    <td>
                      <span className={`badge ${t.obligatoire_a_inscription ? 'badge-danger' : 'badge-success'}`}>
                        <p className='bull'>&bull;</p>
                        {t.obligatoire_a_inscription ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <button className="table-btn view" onClick={() => setTypeEnDetail(t)}>
                        <i className="fas fa-eye"></i>
                      </button>
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
                  <tr><td colSpan="5"><div className="empty">Aucun type de paiement ne correspond à cette recherche.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
            <h2>{typeEnEdition ? 'Modifier le type de paiement' : 'Nouveau type de paiement'}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Code</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: SOUTENANCE" {...register('code', { required: 'Le code est requis' })} />
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div><label>Nom</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: Frais de soutenance" {...register('nom', { required: 'Le nom est requis' })} />
                {errors.nom && <div className="form-errors">{errors.nom.message}</div>}
              </div>
              <div className="form-group">
                <label>Ordre d'affichage</label>
                <input type="number" min="0" {...register('ordre', { valueAsNumber: true })} />
              </div>
              <div className="form-group">
                <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "solid 1px var(--input)" }}>
                  <span style={{ marginRight: "10px" }}>Obligatoire à l'inscription</span>
                  <label className="switch">
                    <input type="checkbox" {...register('obligatoire_a_inscription')} style={{ width: "44px" }} />
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



      <div className="department-modal" style={{ display: typeEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du type de paiement</h2>
            <button onClick={() => setTypeEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {typeEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{typeEnDetail.code}</p></div>
              <div className="form-group"><label>Nom</label><p>{typeEnDetail.nom}</p></div>
              <div className="form-group"><label>Obligatoire à l'inscription</label><p>{typeEnDetail.obligatoire_a_inscription ? 'Oui' : 'Non'}</p></div>
              <div className="form-group"><label>Ordre</label><p>{typeEnDetail.ordre}</p></div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        ouvert={!!typeASupprimer}
        titre="Supprimer le type de paiement"
        message={`Voulez-vous vraiment supprimer « ${typeASupprimer?.nom} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setTypeASupprimer(null)}
        chargement={suppressionEnCours}
      />
    </div>
  );
}
export default TypesPaiement;