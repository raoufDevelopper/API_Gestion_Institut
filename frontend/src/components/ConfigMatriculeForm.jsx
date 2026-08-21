import { useState, useEffect } from 'react';
import { getConfigurationsMatricule, updateConfigurationMatricule, creerConfigurationMatricule } from '../api/parametres';
import { useAlert } from '../context/AlertContext';
const TYPES = [
  { code: 'ETUDIANT', label: 'Étudiants' },
  { code: 'PERSONNEL', label: 'Personnel' },
];
function ConfigMatriculeForm() {
  const [configs, setConfigs] = useState({});
  const { afficherSucces, afficherErreur } = useAlert();
  useEffect(() => {
    getConfigurationsMatricule().then((res) => {
      const parType = {};
      res.data.forEach((c) => { parType[c.type_profil] = c; });
      setConfigs(parType);
    });
  }, []);
  const handleChange = (typeCode, champ, valeur) => {
    setConfigs((prev) => ({
      ...prev,
      [typeCode]: { ...prev[typeCode], [champ]: valeur },
    }));
  };
  const handleEnregistrer = async (typeCode) => {
    const config = configs[typeCode];
    try {
      if (config?.id) {
        const res = await updateConfigurationMatricule(config.id, config);
        setConfigs((prev) => ({ ...prev, [typeCode]: res.data }));
      } else {
        const res = await creerConfigurationMatricule({ ...config, type_profil: typeCode });
        setConfigs((prev) => ({ ...prev, [typeCode]: res.data }));
      }
      afficherSucces(`Format de matricule (${typeCode}) enregistré.`);
    } catch (err) {
      afficherErreur("Erreur lors de l'enregistrement du format de matricule.");
    }
  };
  return (
    <div className="field full">
      <label>Configuration des matricules</label>
      <div className="matricule-configs">
        {TYPES.map(({ code, label }) => {
          const config = configs[code] || {};
          return (
            <div className="matricule-config-bloc" key={code}>
              <h4>{label}</h4>
              <div className="form-grid">
                <div className="field">
                  <label>Préfixe</label>
                  <input
                    type="text"
                    value={config.prefixe || ''}
                    onChange={(e) => handleChange(code, 'prefixe', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Nombre de chiffres</label>
                  <input
                    type="number"
                    min="1"
                    value={config.nombre_chiffres ?? 4}
                    onChange={(e) => handleChange(code, 'nombre_chiffres', parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="field">
                  <label>Séparateur</label>
                  <input
                    type="text"
                    maxLength="3"
                    value={config.separateur ?? '-'}
                    onChange={(e) => handleChange(code, 'separateur', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Inclure l'année</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.inclure_annee ?? true}
                      onChange={(e) => handleChange(code, 'inclure_annee', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {config.compteur !== undefined && (
                  <div className="field">
                    <label>Compteur actuel</label>
                    <input type="text" value={config.compteur} disabled />
                  </div>
                )}
              </div>
              <div className="matricule-apercu">
                Aperçu : <strong>
                  {config.prefixe || 'PREF'}
                  {config.inclure_annee ? `${config.separateur || '-'}${new Date().getFullYear()}` : ''}
                  {config.separateur || '-'}
                  {String(1).padStart(config.nombre_chiffres || 4, '0')}
                </strong>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => handleEnregistrer(code)}>
                <i className="fas fa-save"></i> Enregistrer ce format
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ConfigMatriculeForm;