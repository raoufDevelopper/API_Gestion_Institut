function AbonnementExpire() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-error">Abonnement expiré</h2>
          <p>Votre abonnement a expiré. Veuillez contacter l'administrateur pour le renouveler.</p>
        </div>
      </div>
    </div>
  );
}
export default AbonnementExpire;