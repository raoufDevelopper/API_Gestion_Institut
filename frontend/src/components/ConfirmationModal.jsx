function ConfirmationModal({ ouvert, titre, message, onConfirmer, onAnnuler, chargement }) {
  
    if (!ouvert) return null;
  
    return (
  
        <div className="department-modal" style={{ display: 'flex' }}>
            <div className="modal-content confirmation-modal" style={{ animation: 'pop .3s ease' }}>
                <div className="modal-header" style={{ background: 'linear-gradient(135deg, #7a0303, #d32929)' }}>
                    <h2>{titre}</h2>
                </div>
                <div className="confirmation-body">
                    <i className="fas fa-triangle-exclamation confirmation-icon"></i>
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
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