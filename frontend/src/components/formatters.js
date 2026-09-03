export const formatMontant = (montant) => {
    if (montant === null || montant === undefined || montant === '') {
        return '0 FCFA';
    }
    
    return `${new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(montant))} FCFA`;
};