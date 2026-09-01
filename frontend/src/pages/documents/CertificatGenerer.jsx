
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { creerCertificat, getTypesCertificat } from '../../api/documents';
import { getEtudiants } from '../../api/utilisateurs';
import { useAlert } from '../../context/AlertContext';
import '../../assets/css/crud.css';


function CertificatGenerer() {
  const [types, setTypes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const { afficherSucces, afficherErreur } = useAlert();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm();
  const etudiantId = watch('etudiant');
  const etudiantSelectionne = etudiants.find((e) => String(e.id) === String(etudiantId));
  useEffect(() => {
    getTypesCertificat().then((res) => setTypes(res.data.resultats || res.data));
    getEtudiants().then((res) => setEtudiants(res.data));
  }, []);
  const onSubmit = async (data) => {
    try {
      await creerCertificat(data);
      afficherSucces('Certificat généré avec succès.');
      navigate('/documents/certificats');
    } catch (err) {
      afficherErreur(err.response?.data?.detail || 'Erreur lors de la génération.');
    }
  };



  return (
    <div className="container-principal">
      <div className="department-page">

        <div className="panel-head">
          <div>
            <button className="ud-retour" onClick={() => navigate('/documents/certificats')}>
              <i className="fas fa-arrow-left"></i> 
              Retour à la liste 
            </button>
            <div>
              <h3 style={{ fontSize: '20px' }}>Générer un certificat</h3>
              <div className="sub">générez le certificat d'un étudiant</div>
            </div>
          </div>
        </div>
        
        
        <div className="department-card" style={{ padding: '20px'}}>

          <form onSubmit={handleSubmit(onSubmit)}>

            <div className="fi-grid">
              <div className="fi-champ" style={{ marginBottom: '16px' }}>
                <div><label>Type de certificat</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('type_certificat', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
                {errors.type_certificat && <div className="form-errors">Champ requis</div>}
              </div>

              <div className="fi-champ" style={{ marginBottom: '30px' }}>
                <div><label>Étudiant</label><span className="required" style={{ color: 'red' }}>*</span></div>
                <select {...register('etudiant', { required: true })}>
                  <option value="">Sélectionner...</option>
                  {etudiants.map((e) => <option key={e.id} value={e.id}>{e.nom} {e.prenom} ({e.matricule})</option>)}
                </select>
                {errors.etudiant && <div className="form-errors">Champ requis</div>}
              </div>
            </div>

            {etudiantSelectionne && (
              <div className="dl-group" style={{ marginBottom: '23px' }}>
                <div className="dl-group-title">Informations sur l'étudiant</div>
                <div className="dl-row"><span className="dl-k">Étudiant</span><span className="dl-v">{etudiantSelectionne.nom} {etudiantSelectionne.prenom}</span></div>
                <div className="dl-row"><span className="dl-k">Matricule</span><span className="dl-v mono">{etudiantSelectionne.matricule}</span></div>
                <div className="dl-row"><span className="dl-k">Classe</span><span className="dl-v">{etudiantSelectionne.classe_str || '—'}</span></div>
              </div>
            )}

            <div className="modal-footer" style={{ padding: 0 }}>
              <button type="submit" className="btn-primary addInscr" disabled={isSubmitting}>
                {isSubmitting ? 'Génération...' : 'Générer le certificat'}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>

  );

}

export default CertificatGenerer;