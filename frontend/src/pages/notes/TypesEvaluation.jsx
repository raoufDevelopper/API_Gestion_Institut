import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getTypesEvaluation, creerTypeEvaluation, modifierTypeEvaluation, supprimerTypeEvaluation } from '../../api/notes';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';


function TypesEvaluation() {
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
    const res = await getTypesEvaluation();
    setDonnees(res.data);
  };
  useEffect(() => {
    charger();
  }, []);
  const typesFiltres = donnees.resultats.filter((t) => {
    const texte = (t.code + ' ' + t.libelle).toLowerCase();
    return texte.includes(recherche.toLowerCase());
  });
  const ouvrirCreation = () => {
    setTypeEnEdition(null);
    reset({ code: '', libelle: '', poids: 1, ordre: 0, actif: true });
    setModalOuvert(true);
  };
  const ouvrirEdition = (t) => {
    setTypeEnEdition(t.id);
    reset({ code: t.code, libelle: t.libelle, poids: t.poids, ordre: t.ordre, actif: t.actif });
    setModalOuvert(true);
  };
  const onSubmit = async (data) => {
    try {
      if (typeEnEdition) {
        await modifierTypeEvaluation(typeEnEdition, data);
        afficherSucces("Type d'évaluation modifié avec succès.");
      } else {
        await creerTypeEvaluation(data);
        afficherSucces("Type d'évaluation créé avec succès.");
      }
      reset();
      setModalOuvert(false);
      setTypeEnEdition(null);
      charger();
    } catch (err) {
      afficherErreur(
        err.response?.data?.code?.[0] || "Erreur lors de l'enregistrement."
      );
    }
  };
  const confirmerSuppression = async () => {
    setSuppressionEnCours(true);
    try {
      await supprimerTypeEvaluation(typeASupprimer.id);
      afficherSucces("Type d'évaluation supprimé.");
      setTypeASupprimer(null);
      charger();
    } catch (err) {
      afficherErreur('Erreur lors de la suppression.');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  
  const { total = 0, actif = 0, inactif = 0 } = donnees.kpis;
  
  const sommePoids = donnees.resultats.filter((t) => t.actif).reduce((s, t) => s + parseFloat(t.poids), 0);
  
  
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Types d'évaluation</h3>
            <div className="sub">{total} type(s)</div>
          </div>
          <button className="btn-primary addInscr" onClick={ouvrirCreation}>
            <i className="fas fa-plus"></i>
            Nouveau type
          </button>
        </div>
        
        
        <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div className="department-card">
            <div className="kpi-icon blue"><i className="fas fa-list-check"></i></div>
            <div className="count-top"><h2>{total}</h2><span>Total</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="count-top"><h2>{actif}</h2><span>Actifs</span></div>
          </div>
          <div className="department-card">
            <div className="kpi-icon red"><i className="fas fa-ban"></i></div>
            <div className="count-top"><h2>{inactif}</h2><span>Inactifs</span></div>
          </div>
        </div>


        {Math.abs(sommePoids - 1) > 0.01 && (
          <div className="edt-alerte-conflits" style={{ marginTop: '0', marginBottom: '0' }}>
            <i className="fas fa-triangle-exclamation"></i>
            <div>Attention : la somme des poids des types actifs est de {sommePoids.toFixed(2)}, pas 1.00. Les moyennes seront faussées tant que ce n'est pas corrigé.</div>
          </div>
        )}
        <div className="department-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Rechercher un type d'évaluation..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
          </div>
        </div>


        <div className="department-card table-card">
          <div className="table-title">
            <h2>Liste des types d'évaluation</h2>
            <span>{typesFiltres.length} résultats</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nom / Code</th>
                  <th>Poids</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {typesFiltres.map((t) => (
                  <tr className="row-link" key={t.id}>
                    <td>
                      <div className="cell-strong" style={{ marginBottom: '5px' }}>{t.libelle}</div>
                      <span>{t.code}</span>
                    </td>

                    <td>
                      <span className="badge badge-orange">
                         {t.poids}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.actif ? 'badge-success' : 'badge-danger'}`}>
                        <p className='bull'>&bull;</p>
                        {t.actif ? 'Actif' : 'Inactif'}
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
                  <tr>
                    <td colSpan="6">
                      <div className="empty">Aucun type d'évaluation ne correspond à cette recherche.</div>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          
          </div>
        
        </div>
      
      </div>




      <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
        
        <div className="modal-content">
        
          <div className="modal-header">
            <h2>{typeEnEdition ? "Modifier le type d'évaluation" : "Nouveau type d'évaluation"}</h2>
            <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
  

          <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
            <div className="form-grid">
              <div className="form-group">
                <div><label>Code</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: CC" {...register('code', { required: 'Le code est requis' })} />
                {errors.code && <div className="form-errors">{errors.code.message}</div>}
              </div>
              <div className="form-group">
                <div><label>Libellé</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="text" placeholder="Ex: Contrôle Continu" {...register('libelle', { required: 'Le libellé est requis' })} />
                {errors.libelle && <div className="form-errors">{errors.libelle.message}</div>}
              </div>
              <div className="form-group">
                <div><label>Poids</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <input type="number" step="0.01" min="0" max="1" {...register('poids', { required: true, valueAsNumber: true })} />
                <div className="text-help">
                  EX : 0.40 pour 40%. Et veillez bien à respecter cette notation.
                </div>
              </div>
              <div className="form-group">
                <label>Ordre d'affichage</label>
                <input type="number" min="0" {...register('ordre', { valueAsNumber: true })} />
                <div className="text-help">
                  Précisez l'ordre d'affichage
                </div>
              </div>
              
              <div className="form-group">
                <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "solid 1px var(--input)" }}>
                  <span style={{ marginRight: "10px" }}>Actif</span>
                  <label className="switch">
                    <input type="checkbox" {...register('actif')} />
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
        
          <p id="consigne">
            Le remplissage des champs marqués avec (*) est obligatoire.
            Soumettez le formulaire si consigne respectée !
          </p>
        
        </div>
      
      </div>
      
      
      <div className="department-modal" style={{ display: typeEnDetail ? 'flex' : 'none' }}>
        <div className="modal-content model-detail">
          <div className="modal-header">
            <h2>Détail du type d'évaluation</h2>
            <button onClick={() => setTypeEnDetail(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {typeEnDetail && (
            <div className="form-grid" style={{ padding: '20px' }}>
              <div className="form-group"><label>Code</label><p className="mono">{typeEnDetail.code}</p></div>
              <div className="form-group"><label>Libellé</label><p>{typeEnDetail.libelle}</p></div>
              <div className="form-group"><label>Poids</label><p>{typeEnDetail.poids}</p></div>
              <div className="form-group"><label>Ordre</label><p>{typeEnDetail.ordre}</p></div>
              <div className="form-group"><label>Statut</label><p>{typeEnDetail.actif ? 'Actif' : 'Inactif'}</p></div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        ouvert={!!typeASupprimer}
        titre="Supprimer le type d'évaluation"
        message={`Voulez-vous vraiment supprimer « ${typeASupprimer?.libelle} » ?`}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setTypeASupprimer(null)}
        chargement={suppressionEnCours}
      />

    </div>

  );

}


export default TypesEvaluation;