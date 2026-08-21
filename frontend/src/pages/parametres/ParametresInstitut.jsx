import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getParametreInstitut, updateParametreInstitut } from '../../api/parametres';
import { useAlert } from '../../context/AlertContext';
import ConfigMatriculeForm from '../../components/ConfigMatriculeForm';
import '../../assets/css/parametre.css'



const ONGLETS = [
  { id: 'general', label: '1. Informations Générales', icone: 'fa-building' },
  { id: 'identite', label: '2. Identité Visuelle', icone: 'fa-palette' },
  { id: 'contact', label: '3. Contact & Adresse', icone: 'fa-envelope' },
  { id: 'legal', label: '4. Informations Légales', icone: 'fa-file-contract' },
  { id: 'academique', label: '5. Paramètres Académiques', icone: 'fa-graduation-cap' },
  { id: 'bibliotheque_bourses', label: '6. Bibliothèque & Bourses', icone: 'fa-book' },
];




function ParametresInstitut() {

    const [ongletActif, setOngletActif] = useState('general');

    const [logoApercu, setLogoApercu] = useState(null);

    const { afficherSucces, afficherErreur } = useAlert();

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    useEffect(() => {

        getParametreInstitut().then((res) => {
            reset(res.data);
            if (res.data.logo) setLogoApercu(res.data.logo);
        });

    }, [reset]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) setLogoApercu(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        const formData = new FormData();

        Object.entries(data).forEach(([cle, valeur]) => {
            if (cle === 'logo' || cle === 'favicon') 
            {
                if (valeur instanceof FileList && valeur.length > 0){
                    formData.append(cle, valeur[0]);
                }
            } 
            else if (typeof valeur === 'boolean') 
            {
                formData.append(cle, valeur);
            } 
            else if (valeur !== null && valeur !== undefined) 
            {
                formData.append(cle, valeur);
            }
        });


        try {
            await updateParametreInstitut(formData);
            afficherSucces('Paramètres enregistrés avec succès !');
        } catch (err) {
            afficherErreur('Une erreur est survenue lors de l\'enregistrement.');
        }
    };

    


    return (
        
        <div className="container-principal">
            
            <form onSubmit={handleSubmit(onSubmit)} id="parametresForm">
            
                <header className="header">
                    <div className='parametre-title'>
                        <h1>Paramètres de l'Institut</h1>
                        <span>définissez les paramètres de votre institut</span>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        <i className="fas fa-save"></i>
                        <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                    </button>
                </header>
        


                <nav className="tabs" id="tabNav">
                    {ONGLETS.map((onglet) => (
                        <button key={onglet.id} type="button" className={`tab-btn ${ongletActif === onglet.id ? 'active' : ''}`} onClick={() => setOngletActif(onglet.id)}>
                            {onglet.label}
                        </button>
                    ))}
                </nav>




                {/* ---- TAB 1 : Informations Générales ---- */}
                <section className={`tab-panel ${ongletActif === 'general' ? 'active' : ''}`}>
                    
                    <div className="content-grid">

                        <div className="panel">
                            <div className="panel-header">
                                <div className="panel-icon"><i className="fas fa-building"></i></div>
                                <div>
                                    <h2>Informations Générales</h2>
                                    <p>Renseignez les informations principales de votre institut.</p>
                                </div>
                            </div>
                            <div className="form-grid">
                            <div className="field">
                                <label>Nom de l'Institut</label>
                                <input type="text" {...register('nom')} />
                            </div>
                            <div className="field">
                                <label>Sigle</label>
                                <input type="text" {...register('sigle')} />
                            </div>
                            <div className="field full">
                                <label>Slogan</label>
                                <input type="text" {...register('slogan')} />
                            </div>
                            <div className="field">
                                <label>Type d'établissement</label>
                                <select {...register('type_etablissement')}>
                                <option value="public">Public</option>
                                <option value="prive">Privé</option>
                                <option value="semi_public">Semi-public</option>
                                </select>
                            </div>
                            <div className="field">
                                <label>Directeur Général</label>
                                <input type="text" {...register('directeur_general')} />
                            </div>
                            <div className="field">
                                <label>Date de Création</label>
                                <input type="date" {...register('date_creation_institut')} />
                            </div>
                            <div className="field full">
                                <label>Description de l'Institut</label>
                                <textarea rows="4" {...register('description')}></textarea>
                            </div>
                            </div>
                        </div>


                        <aside className="panel side-panel">
                            
                            <h3 className="side-title">Logo de l'Institut</h3>
                            
                            <div className="logo-frame" id="logoFrame">
                                {logoApercu ? (
                                    <img src={logoApercu} alt="Logo de l'institut" />
                                ) : (
                                    <span style={{ color: '#9aa1b1', fontSize: '13px' }}>Aucun logo</span>
                                )}
                            </div>
                            
                            <input type="file" accept="image/*" {...register('logo', { onChange: handleLogoChange })} />
                            
                            <div className="info-box">
                                <span className="dot">i</span>
                                <span>Formats acceptés : PNG, JPG, SVG<br />Taille recommandée : 512x512px</span>
                            </div>
                        
                        </aside>

                    </div>

                </section>







                {/* ---- TAB 2 : Identité Visuelle ---- */}
                <section className={`tab-panel ${ongletActif === 'identite' ? 'active' : ''}`}>
                    
                    <div className="content-grid no-side">
                    
                        <div className="panel">
                            
                            <div className="panel-header">
                                <div className="panel-icon"><i className="fas fa-palette"></i></div>
                                <div>
                                    <h2>Identité Visuelle</h2>
                                    <p>Définissez les couleurs de votre institut.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="field full">
                                    <label>Couleurs de la marque</label>
                                    <div className="swatch-row">
                                    <div className="swatch">
                                        <input type="color" {...register('couleur_primaire')} />
                                        <span>Principale</span>
                                    </div>
                                    <div className="swatch">
                                        <input type="color" {...register('couleur_secondaire')} />
                                        <span>Secondaire</span>
                                    </div>
                                    </div>
                                </div>
                                <div className="field full">
                                    <label>Favicon</label>
                                    <input type="file" accept="image/*" {...register('favicon')} />
                                </div>
                            </div>

                        </div>

                    </div>

                </section>
                
                




                
                {/* ---- TAB 3 : Contact & Adresse ---- */}
                <section className={`tab-panel ${ongletActif === 'contact' ? 'active' : ''}`}>
                    
                    <div className="content-grid no-side">
                    
                        <div className="panel">
                            <div className="panel-header">
                            <div className="panel-icon"><i className="fas fa-envelope"></i></div>
                            <div>
                                <h2>Contact & Adresse</h2>
                                <p>Renseignez les coordonnées de contact de votre institut.</p>
                            </div>
                            </div>
                            <div className="form-grid">
                                <div className="field"><label>Adresse e-mail</label><input type="email" {...register('email')} /></div>
                                <div className="field"><label>Téléphone</label><input type="text" {...register('telephone')} /></div>
                                <div className="field"><label>Site web</label><input type="url" {...register('site_web')} /></div>
                                <div className="field full"><label>Adresse</label><input type="text" {...register('adresse')} /></div>
                                <div className="field"><label>Ville</label><input type="text" {...register('ville')} /></div>
                                <div className="field"><label>Pays</label><input type="text" {...register('pays')} /></div>
                                <div className="field"><label>Boîte postale</label><input type="text" {...register('boite_postale')} /></div>
                            </div>
                        </div>

                    </div>

                </section>
                
                
                

                
                
                
                {/* ---- TAB 4 : Informations Légales ---- */}
                <section className={`tab-panel ${ongletActif === 'legal' ? 'active' : ''}`}>
                    <div className="content-grid no-side">
                    <div className="panel">
                        <div className="panel-header">
                        <div className="panel-icon"><i className="fas fa-file-contract"></i></div>
                        <div>
                            <h2>Informations Légales</h2>
                            <p>Renseignez les informations juridiques et administratives.</p>
                        </div>
                        </div>
                        <div className="form-grid">
                        <div className="field"><label>Numéro d'agrément</label><input type="text" {...register('numero_agrement')} /></div>
                        <div className="field"><label>Numéro RCCM</label><input type="text" {...register('numero_rccm')} /></div>
                        <div className="field"><label>Numéro contribuable</label><input type="text" {...register('numero_contribuable')} /></div>
                        <div className="field"><label>Représentant légal</label><input type="text" {...register('representant_legal')} /></div>
                        </div>
                    </div>
                    </div>
                </section>







                {/* ---- TAB 5 : Paramètres Académiques ---- */}
                <section className={`tab-panel ${ongletActif === 'academique' ? 'active' : ''}`}>
                    <div className="content-grid no-side">
                    <div className="panel">
                        <div className="panel-header">
                        <div className="panel-icon"><i className="fas fa-graduation-cap"></i></div>
                        <div>
                            <h2>Paramètres Académiques</h2>
                            <p>Configurez les règles académiques de votre institut.</p>
                        </div>
                        </div>
                        <div className="form-grid">
                        <div className="field">
                            <label>Note d'admission minimale</label>
                            <input type="number" step="0.01" {...register('note_admission_minimale')} />
                        </div>
                        <div className="field">
                            <label>Crédits requis par semestre</label>
                            <input type="number" {...register('credits_requis_semestre')} />
                        </div>
                        <div className="field">
                            <label>Crédits requis par an</label>
                            <input type="number" {...register('credits_requis_annee')} />
                        </div>

                        <ConfigMatriculeForm />

                        <div className="field full">
                            <label>Options</label>
                            <div className="toggle-list">
                            <div className="toggle-row">
                                <div className="toggle-row-text">
                                <strong>Inscriptions en ligne</strong>
                                <span>Permettre aux étudiants de s'inscrire directement depuis le portail.</span>
                                </div>
                                <label className="switch">
                                <input type="checkbox" {...register('inscriptions_en_ligne')} />
                                <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-row">
                                <div className="toggle-row-text">
                                <strong>Notation par les enseignants en ligne</strong>
                                <span>Autoriser la saisie des notes directement sur la plateforme.</span>
                                </div>
                                <label className="switch">
                                <input type="checkbox" {...register('notation_enseignants_en_ligne')} />
                                <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-row">
                                <div className="toggle-row-text">
                                <strong>Redoublement automatique</strong>
                                <span>Appliquer automatiquement le redoublement en cas de note insuffisante.</span>
                                </div>
                                <label className="switch">
                                <input type="checkbox" {...register('redoublement_automatique')} />
                                <span className="slider"></span>
                                </label>
                            </div>
                            <div className="toggle-row">
                                <div className="toggle-row-text">
                                <strong>Notifications aux parents</strong>
                                <span>Envoyer un e-mail aux tuteurs après la publication des résultats.</span>
                                </div>
                                <label className="switch">
                                <input type="checkbox" {...register('notifications_parents')} />
                                <span className="slider"></span>
                                </label>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </section>







                {/* ---- TAB 6 : Bibliothèque & Bourses ---- */}
                <section className={`tab-panel ${ongletActif === 'bibliotheque_bourses' ? 'active' : ''}`}>
                <div className="content-grid no-side">
                    <div className="panel">
                    <div className="panel-header">
                        <div className="panel-icon"><i className="fas fa-book"></i></div>
                        <div>
                        <h2>Bibliothèque</h2>
                        <p>Configurez les règles d'emprunt et de pénalité.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="field">
                        <label>Durée d'emprunt (jours)</label>
                        <input type="number" {...register('duree_emprunt_jours')} />
                        </div>
                        <div className="field">
                        <label>Nombre max d'emprunts simultanés</label>
                        <input type="number" {...register('nb_emprunts_max_simultanes')} />
                        </div>
                        <div className="field">
                        <label>Pénalité par jour de retard</label>
                        <input type="number" step="0.01" {...register('penalite_par_jour_retard')} />
                        </div>
                    </div>
                    </div>
                    <div className="panel">
                    <div className="panel-header">
                        <div className="panel-icon"><i className="fas fa-hand-holding-heart"></i></div>
                        <div>
                        <h2>Bourses</h2>
                        <p>Définissez la réduction par défaut appliquée aux étudiants boursiers.</p>
                        </div>
                    </div>
                    <div className="form-grid">
                        <div className="field">
                        <label>Type de réduction par défaut</label>
                        <select {...register('type_reduction_bourse_defaut')}>
                            <option value="pourcentage">Pourcentage</option>
                            <option value="montant_fixe">Montant fixe</option>
                        </select>
                        </div>
                        <div className="field">
                        <label>Valeur de la réduction par défaut</label>
                        <input type="number" step="0.01" {...register('valeur_reduction_bourse_defaut')} />
                        </div>
                    </div>
                    </div>
                </div>
                </section>

            </form>

        </div>
        
    );

}


export default ParametresInstitut;