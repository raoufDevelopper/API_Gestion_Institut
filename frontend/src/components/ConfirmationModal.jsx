function ConfirmationModal({ ouvert, titre, message, onConfirmer, onAnnuler, chargement }) {
  
    if (!ouvert) return null;
  
    return (
  
        <div className="department-modal" style={{ display: 'flex' }}>
            
            <div className="modal-content confirmation-modal" style={{ animation: 'pop .3s ease'}}>
            
                <div className="confirme-header">
                    <h2>{titre}</h2>
                </div>
            
                <div className="confirmation-body">
                    <p>Vous êtes sur le point de supprimer un enregistrement</p>
                    <div>
                        <p id="attention">
                            <i className="fas fa-triangle-exclamation confirmation-icon"></i>
                            Attention
                        </p>
                        <p id="message2">
                            {message}
                        </p>
                    </div>
                    <p>Plutôt que de supprimer cet enregistrement, vous pouvez modifier son statut car cette action est irreversible !</p>
                </div>
            
                <div className="modal-footer" style={{ justifyContent: "center" }}>
                    <button type="button" className="btn-light" onClick={onAnnuler} disabled={chargement}>
                        Annuler
                    </button>
                    <button type="button" className="btn-danger" onClick={onConfirmer} disabled={chargement}>
                        {chargement ? 'Suppression...' : 'Confirmer la suppression'}
                    </button>
                </div>
            
            </div>
        
        </div>

    );
}
export default ConfirmationModal;