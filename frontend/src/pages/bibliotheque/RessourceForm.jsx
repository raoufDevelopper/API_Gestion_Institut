
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { creerRessource, modifierRessource, getRessource, getAuteurs, getEditeurs, getCategories, getLocalisations, creerExemplairesEnMasse } from '../../api/bibliotheque';
import { getFilieres, getSpecialites } from '../../api/academique';
import { useAlert } from '../../context/AlertContext';
import { TYPES_RESSOURCE, ETATS_PHYSIQUE } from './bibliothequeConstantes';
import '../../assets/css/crud.css';
import '../../assets/css/documents.css';


const ETAPES = ['Informations', 'Classification', 'Exemplaires', 'Résumé'];


function RessourceForm() {
  const { id } = useParams();
  const modeEdition = !!id;
  const navigate = useNavigate();
  const { afficherSucces, afficherErreur } = useAlert();
  const [etape, setEtape] = useState(1);
  const [auteurs, setAuteurs] = useState([]);
  const [editeurs, setEditeurs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [localisations, setLocalisations] = useState([]);
  const [nbExemplairesInitiaux, setNbExemplairesInitiaux] = useState(1);
  const [localisationEx, setLocalisationEx] = useState('');
  const [couverturePreview, setCouverturePreview] = useState(null);
  const { register, handleSubmit, watch, trigger, reset, formState: { errors, isSubmitting } } = useForm();
  const donnees = watch();

  useEffect(() => {
    getAuteurs().then((res) => setAuteurs(res.data));
    getEditeurs().then((res) => setEditeurs(res.data));
    getCategories().then((res) => setCategories(res.data));
    getFilieres().then((res) => {
      const toutes = res.data.resultats || res.data;
      setFilieres(toutes.filter((f) => f.statut === 'actif'));
    });
    getSpecialites().then((res) => {
      const toutes = res.data.resultats || res.data;
      setSpecialites(toutes.filter((s) => s.statut === 'actif'));
    });
    getLocalisations().then((res) => setLocalisations(res.data));
  }, []);
  
  useEffect(() => {
    if (!modeEdition) return;
    getRessource(id).then((res) => {
      reset({
        ...res.data,
        auteurs: (res.data.auteurs || []).map(String),
      });
      if (res.data.couverture) setCouverturePreview(res.data.couverture);
    });
  }, [id, modeEdition, reset]);
  
  const champsParEtape = [
    ['type_ressource', 'titre'],
    [],
    [],
    [],
  ];
  
  const suivant = async () => {
    const valide = await trigger(champsParEtape[etape - 1]);
    if (valide) setEtape((e) => e + 1);
  };
  
  const handleCouvertureChange = (e) => {
    const file = e.target.files[0];
    if (file) setCouverturePreview(URL.createObjectURL(file));
  };
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([cle, valeur]) => {
      if (cle === 'auteurs') {
        [].concat(valeur || []).forEach((v) => formData.append('auteurs', v));
      } else if (['couverture', 'fichier_numerique'].includes(cle)) {
        if (valeur instanceof FileList && valeur.length > 0) formData.append(cle, valeur[0]);
      } else if (valeur !== null && valeur !== undefined && valeur !== '') {
        formData.append(cle, valeur);
      }
    });
    try {
      let ressourceId = id;
      if (modeEdition) {
        await modifierRessource(id, formData);
      } else {
        const res = await creerRessource(formData);
        ressourceId = res.data.id;
        if (nbExemplairesInitiaux > 0) {
          await creerExemplairesEnMasse({ ressource: ressourceId, quantite: nbExemplairesInitiaux, localisation: localisationEx || null, etat: 'BON' });
        }
      }
      afficherSucces(modeEdition ? 'Ressource modifiée avec succès.' : 'Ressource créée avec succès.');
      navigate(`/bibliotheque/catalogue/${ressourceId}`);
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement de la ressource.");
    }
  };
  
  
  
  return (
    <div className="container-principal">
      <div className="department-page">


        <div className="fi-header" style={{ marginBottom: "-20px" }}>
          <div>
            <button className="ud-retour" onClick={() => navigate('/bibliotheque/catalogue')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <span>  {modeEdition ? ' - Modifier la ressource' : ' - Ajouter une ressource'}</span>
          </div>
        </div>

        <div className="panel-head">
          <div>
            <h3 style={{ fontSize: '20px' }}>{modeEdition ? 'Modifier la ressource' : 'Ajouter une ressource'}</h3>
            <span className='sub'>{modeEdition ? 'Modifier une ressource ici...' : 'Ajouter une nouvelle ressource ici...'}</span>
          </div>
        </div>


  
        <div className="doc-wizard-steps">
          {ETAPES.map((label, i) => (
            <div key={i} className={`doc-wizard-step ${etape === i + 1 ? 'actif' : ''} ${etape > i + 1 ? 'complete' : ''}`}>
              <span className="num">{etape > i + 1 ? '✓' : i + 1}</span> {label}
            </div>
          ))}
        </div>



        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="department-card" style={{ padding: '20px' }}>

            {etape === 1 && (
            
              <div className="fi-grid">
              
                <div className="fi-champ">
                  <div><label>Type de ressource</label><span className="required" style={{ color: 'red' }}>*</span></div>
                  <select {...register('type_ressource', { required: true })}>
                    {TYPES_RESSOURCE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              
                <div className="fi-champ">
                  <div><label>Titre</label><span className="required" style={{ color: 'red' }}>*</span></div>
                  <input type="text" {...register('titre', { required: true })} />
                  {errors.titre && <div className="form-errors">Champ requis</div>}
                </div>
              
                <div className="fi-champ">
                  <label>Sous-titre</label>
                  <input type="text" {...register('sous_titre')} />
                </div>
              
                <div className="fi-champ">
                  <label>ISBN / ISSN</label>
                  <input type="text" {...register('isbn_issn')} />
                </div>
              
                <div className="fi-champ">
                  <label>Éditeur</label>
                  <select {...register('editeur')}>
                    <option value="">Aucun</option>
                    {editeurs.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </div>
              
                <div className="fi-champ">
                  <label>Année de publication</label>
                  <input type="number" {...register('annee_publication')} />
                </div>
              
                <div className="fi-champ">
                  <label>Édition</label>
                  <input type="text" {...register('edition')} />
                </div>
              
                <div className="fi-champ">
                  <label>Langue</label>
                  <input type="text" {...register('langue')} />
                </div>
              
                {donnees.type_ressource === 'NUMERIQUE' && (
                  <div className="fi-champ">
                    <label>Fichier numérique</label>
                    <input type="file" {...register('fichier_numerique')} />
                  </div>
                )}
              
                <div className="fi-champ full">
                  <label>Description / résumé</label>
                  <textarea rows="3" {...register('description')}></textarea>
                </div>
              
                <div className="fi-champ">
                  <label>Auteurs</label>
                  <div className="permissions-select">
                    {auteurs.map((a) => (
                      <label key={a.id} className="permission-checkbox">
                        <input type="checkbox" value={a.id} {...register('auteurs')} /> {a.nom} {a.prenom}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="fi-champ avatar-upload-group">
                   <label>Couverture</label>
                  <input type="file" accept="image/*" {...register('couverture', { onChange: handleCouvertureChange })} />
                  <div className='text-help' style={{ color: '#9ca3af' }}>
                    ajoutez la photo de couverture de la resource
                  </div>
                  <div className="avatar-upload-preview">
                    {couverturePreview ? <img src={couverturePreview} alt="Aperçu" /> : <i className="fas fa-image"></i>}
                  </div>
                </div>
              
              </div>
            
            )}
            
            
            
            
            
            {etape === 2 && (
              <div className="fi-grid">

                <div className="fi-champ">
                  <label>Catégorie</label>
                  <select {...register('categorie')}>
                    <option value="">Aucune</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                
                <div className="fi-champ">
                  <label>Mots-clés</label>
                  <input type="text" placeholder="Séparés par des virgules" {...register('mots_cles')} />
                </div>
                
                <div className="fi-champ">
                  <label>Filière</label>
                  <select {...register('filiere')}>
                    <option value="">Aucune</option>
                    {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                  </select>
                </div>
                
                <div className="fi-champ">
                  <label>Spécialité</label>
                  <select {...register('specialite')}>
                    <option value="">Aucune</option>
                    {specialites.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              
              </div>
            
            )}
            
            
            {etape === 3 && (
              <div className="fi-grid">
               
                <div className="fi-champ">
                  <label>Nombre d'exemplaires à créer</label>
                  <input type="number" min="0" max="100" value={nbExemplairesInitiaux} onChange={(e) => setNbExemplairesInitiaux(Number(e.target.value))} />
                </div>
               
                <div className="fi-champ">
                  <label>Localisation</label>
                  <select value={localisationEx} onChange={(e) => setLocalisationEx(e.target.value)}>
                    <option value="Non localisé">Non localisé</option>
                    {localisations.map((l) => <option key={l.id} value={l.id}>{[l.salle, l.rayon, l.etagere].filter(Boolean).join(' → ')}</option>)}
                  </select>
                </div>

              </div>
            )}


            {etape === 4 && (
              <div className="dl-group">
                <div className="dl-row"><span className="dl-k">Titre</span><span className="dl-v">{donnees.titre}</span></div>
                <div className="dl-row"><span className="dl-k">Type</span><span className="dl-v">{TYPES_RESSOURCE.find((t) => t.value === donnees.type_ressource)?.label}</span></div>
                <div className="dl-row"><span className="dl-k">ISBN/ISSN</span><span className="dl-v">{donnees.isbn_issn || '—'}</span></div>
                {!modeEdition && <div className="dl-row"><span className="dl-k">Exemplaires à créer</span><span className="dl-v">{nbExemplairesInitiaux}</span></div>}
              </div>
            )}
            
            
            <div className="modal-footer" style={{ padding: '20px 0 0' }}>
              {etape > 1 && <button type="button" className="btn-light" onClick={() => setEtape((e) => e - 1)}>Précédent</button>}
              {etape < 4 ? (
                <button type="button" className="btn-primary addInscr" onClick={suivant}>Suivant →</button>
              ) : (
                <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              )}
            </div>

          </div>

        </form>

      </div>

    </div>

  );

}



export default RessourceForm;
