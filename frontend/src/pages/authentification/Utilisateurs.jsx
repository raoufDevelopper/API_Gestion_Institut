import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getUtilisateurs, creerUtilisateur, modifierUtilisateur, supprimerUtilisateur } from '../../api/utilisateurs_auth';
import { getRoles } from '../../api/roles';
import { useAlert } from '../../context/AlertContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import '../../assets/css/crud.css';









function Utilisateurs() {
  
    const [donnees, setDonnees] = useState({ resultats: [], kpis: {} });
  
    const [roles, setRoles] = useState([]);
    
    const [recherche, setRecherche] = useState('');
    
    const [modalOuvert, setModalOuvert] = useState(false);
    
    const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null);
    
    const [utilisateurASupprimer, setUtilisateurASupprimer] = useState(null);
    
    const [suppressionEnCours, setSuppressionEnCours] = useState(false);
    
    const [utilisateurEnDetail, setUtilisateurEnDetail] = useState(null);
    
    const [apercuPhoto, setApercuPhoto] = useState(null);
    
    const { afficherSucces, afficherErreur } = useAlert();
    
    const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();



    const charger = async () => {
        const res = await getUtilisateurs();
        setDonnees(res.data);
    };

    useEffect(() => {
        charger();
        getRoles().then((res) => setRoles(res.data));
    }, []);

    const utilisateursFiltres = donnees.resultats.filter((u) => {
        const texte = (u.username + ' ' + u.email + ' ' + (u.role_nom || '')).toLowerCase();
        return texte.includes(recherche.toLowerCase());
    });

    const ouvrirCreation = () => {
        setUtilisateurEnEdition(null);
        setApercuPhoto(null);
        reset({ username: '', email: '', role: '', password: '', is_active: true });
        setModalOuvert(true);
    };

    const ouvrirEdition = (utilisateur) => {
        setUtilisateurEnEdition(utilisateur.id);
        setApercuPhoto(utilisateur.photo_profil);
        reset({
        username: utilisateur.username,
        email: utilisateur.email,
        role: utilisateur.role || '',
        is_active: utilisateur.is_active,
        password: '',
        });
        setModalOuvert(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) setApercuPhoto(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append('username', data.username);

        formData.append('email', data.email);

        if (data.role) formData.append('role', data.role);

        formData.append('is_active', data.is_active);

        if (data.password) formData.append('password', data.password);

        if (data.photo_profil?.[0]) formData.append('photo_profil', data.photo_profil[0]);

        try {
        if (utilisateurEnEdition) {
            await modifierUtilisateur(utilisateurEnEdition, formData);
            afficherSucces('Utilisateur modifié avec succès.');

        } else {
            await creerUtilisateur(formData);
            afficherSucces('Utilisateur créé avec succès.');
        
        }
        
        reset();
        
        setModalOuvert(false);
        
        setUtilisateurEnEdition(null);
        
        charger();
        
        } catch (err) {
        afficherErreur(
            err.response?.data?.username?.[0] ||
            err.response?.data?.email?.[0] ||
            "Erreur lors de l'enregistrement de l'utilisateur."
        );
        }
    
    };

  
    const confirmerSuppression = async () => {
    
        setSuppressionEnCours(true);
    
        try {
        await supprimerUtilisateur(utilisateurASupprimer.id);
        afficherSucces('Utilisateur supprimé.');
        setUtilisateurASupprimer(null);
        charger();
    
        } catch (err) {
        afficherErreur('Erreur lors de la suppression.');
    
        } finally {
        setSuppressionEnCours(false);
        }
    
    };
    
    const { total = 0, actifs = 0, desactives = 0 } = donnees.kpis;
  
  
  
  
    return (
        <div className="container-principal">

            <div className="department-page">
                {/* HEADER */}
                <div className="panel-head">
                    <div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Gestion des utilisateurs</h3>
                        <div className="sub">{total} utilisateur(s)</div>
                    </div>
                    <button className="btn-primary addInscr" onClick={ouvrirCreation}>
                        <i className="fas fa-plus"></i>
                        Nouvel utilisateur
                    </button>
                </div>

                
                {/* KPI */}
                <div className="department-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
               
                    <div className="department-card">
                        <div className="kpi-icon blue"><i className="fas fa-users"></i></div>
                        <div className="count-top"><h2>{total}</h2><span>Utilisateurs</span></div>
                    </div>
                    <div className="department-card">
                        <div className="kpi-icon green"><i className="fas fa-user-check"></i></div>
                        <div className="count-top"><h2>{actifs}</h2><span>Actifs</span></div>
                    </div>
                    <div className="department-card">
                        <div className="kpi-icon red"><i className="fas fa-user-slash"></i></div>
                        <div className="count-top"><h2>{desactives}</h2><span>Désactivés</span></div>
                    </div>
                
                </div>
                
                
                {/* TOOLBAR */}
                <div className="department-toolbar">
                    <div className="toolbar-left">
                        <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input type="text" placeholder="Rechercher un utilisateur..." value={recherche} onChange={(e) => setRecherche(e.target.value)}/>
                        </div>
                    </div>
                </div>
                
                
                {/* TABLE */}
                <div className="department-card table-card">
                    <div className="table-title">
                        <h2>Liste des utilisateurs</h2>
                        <span>{utilisateursFiltres.length} utilisateurs</span>
                    </div>
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>Utilisateur</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Statut</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilisateursFiltres.map((u) => (
                                <tr className="row-link" key={u.id}>
                                    <td>
                                        <div className="cell-with-avatar">
                                            {u.photo_profil ? (
                                            <img src={u.photo_profil} alt="" className="avatar-mini" />
                                            ) : (
                                            <div className="avatar-mini avatar-placeholder"><i className="fas fa-user"></i></div>
                                            )}
                                            <div className="cell-strong">{u.username}</div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.role_nom || '—'}</td>
                                    <td>
                                        <span className={`badge-${u.is_active ? 'success' : 'danger'}`}>
                                            <span className="dot"></span>
                                            {u.is_active ? 'Actif' : 'Désactivé'}
                                        </span>
                                    </td>
                                    <td>
                                    <button className="table-btn view" onClick={() => setUtilisateurEnDetail(u)}>
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="table-btn edit" onClick={() => ouvrirEdition(u)}>
                                        <i className="fas fa-pen"></i>
                                    </button>
                                    <button className="table-btn delete" onClick={() => setUtilisateurASupprimer(u)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                    </td>
                                </tr>
                                ))}
                                {utilisateursFiltres.length === 0 && (
                                <tr>
                                    <td colSpan="5">
                                    <div className="empty">Aucun utilisateur ne correspond à cette recherche.</div>
                                    </td>
                                </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>



            {/* MODAL DE CREATION / MODIFICATION */}
            <div className="department-modal" style={{ display: modalOuvert ? 'flex' : 'none' }}>
                
                <div className="modal-content">
                    
                    <div className="modal-header" style={{ background: 'linear-gradient(135deg, #400c7c, #a14fff)' }}>
                        <h2>{utilisateurEnEdition ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</h2>
                        <button className="btn-primary addInscr" onClick={() => setModalOuvert(false)}>
                        <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} id="departmentForm">
                        <div className="form-grid">
                        
                        <div className="form-group avatar-upload-group">
                            <div className="avatar-upload-preview">
                                {apercuPhoto ? (
                                    <img src={apercuPhoto} alt="Aperçu" />
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                            <label>Photo de profil</label>
                            <input type="file" accept="image/*" {...register('photo_profil', { onChange: handlePhotoChange })}/>
                        </div>
                       
                        <div className="form-group">
                            <div>
                            <label>Nom d'utilisateur</label>
                            <span className="required" style={{ color: 'red' }}>*</span>
                            </div>
                            <input type="text" {...register('username', { required: "Le nom d'utilisateur est requis" })} placeholder='Entrez le nom d utilisateur'/>
                            {errors.username && <div className="text-error form-error">{errors.username.message}</div>}
                            <div className="text-help">
                                Le nom d'utilisateur ne doit pas contenir d'espace. 
                                Il doit obligatoirement être en un mot !
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <div>
                            <label>Email</label>
                            <span className="required" style={{ color: 'red' }}>*</span>
                            </div>
                            <input type="email" {...register('email', { required: "L'email est requis" })} placeholder='Entrez l adresse mail'/>
                            {errors.email && <div className="text-error form-error">{errors.email.message}</div>}
                            <div className="text-help">
                                Cette adresse mail peut être differente de celle 
                                que vous allez renseigner au niveau des informations 
                                personnel de l'étudiant ou du personnel.
                            </div>
                        </div>
                       
                        <div className="form-group">
                            <label>Rôle</label>
                            <select {...register('role')}>
                            <option value="">Aucun rôle</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.nom}</option>
                            ))}
                            </select>
                            <div className="text-help">
                                Choisissez un rôle ou laissez à Aucun rôle si 
                                cet utilisateur n'a aucun droit dans l'application.
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <div>
                            <label>{utilisateurEnEdition ? 'Nouveau mot de passe' : 'Mot de passe'}</label>
                            {!utilisateurEnEdition && <span className="required" style={{ color: 'red' }}>*</span>}
                            </div>
                            <input type="password" {...register('password', { required: !utilisateurEnEdition && 'Le mot de passe est requis' })} placeholder='Entrez le mot de passe'/>
                            {utilisateurEnEdition && (
                            <div className="text-help">Laisser vide pour ne pas changer le mot de passe.</div>
                            )}       
                            {errors.password && <div className="text-error form-error">{errors.password.message}</div>}
                            <div className="text-help">
                                Le mot de passe doit vontenir 8 caractères au minimim 
                                et il ne doit pas être fragile ! Mélangez des lettres, 
                                chiffres et caractères spéciaux pour plus de sécurité.
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="switch-row" style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "solid 1px var(--input)" }}>
                                <span style={{ marginRight: "10px" }}>Compte actif</span>
                                <label className="switch">
                                    <input type="checkbox" {...register('is_active')} style={{ width: "44px" }}/>
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
            
            
            
            {/* MODAL DETAIL */}
            <div className="department-modal" style={{ display: utilisateurEnDetail ? 'flex' : 'none' }}>
                <div className="modal-content model-detail">
                <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}>
                    <h2>Détail de l'utilisateur</h2>
                    <button onClick={() => setUtilisateurEnDetail(null)}>
                    <i className="fas fa-times"></i>
                    </button>
                </div>
                {utilisateurEnDetail && (
                    <div className="form-grid" style={{ padding: '20px' }}>
                    <div className="form-group" style={{ display: "flex", alignItems: "center", flexDirection: "initial", gap: "20px" }}>
                        {utilisateurEnDetail.photo_profil ? (
                        <img src={utilisateurEnDetail.photo_profil} alt={utilisateurEnDetail.username} className="avatar-detail" id='detail-img'/>
                        ) : (
                        <div className="avatar-detail avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                        <label>photo de profil</label>
                    </div>
                    <div className="form-group">
                        <label>Nom d'utilisateur</label>
                        <p>{utilisateurEnDetail.username}</p>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <p>{utilisateurEnDetail.email}</p>
                    </div>
                    <div className="form-group">
                        <label>Rôle</label>
                        <p>{utilisateurEnDetail.role_nom || '—'}</p>
                    </div>
                    <div className="form-group">
                        <label>Statut</label>
                        <p>{utilisateurEnDetail.is_active ? 'Actif' : 'Désactivé'}</p>
                    </div>
                    <div className="form-group">
                        <label>Inscrit le</label>
                        <p>{new Date(utilisateurEnDetail.date_joined).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    </div>
                )}
                </div>
            </div>
            
            
            
            {/* MODAL DE CONFIRMATION SUPPRESSION */}
            <ConfirmationModal
                ouvert={!!utilisateurASupprimer}
                titre="Supprimer l'utilisateur"
                message={`Voulez-vous vraiment supprimer l'utilisateur « ${utilisateurASupprimer?.username} » ?`}
                onConfirmer={confirmerSuppression}
                onAnnuler={() => setUtilisateurASupprimer(null)}
                chargement={suppressionEnCours}
            />

        </div>
    );

}

export default Utilisateurs;