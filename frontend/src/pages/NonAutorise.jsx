function NonAutorise() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-error">Accès refusé</h2>
        <p>Vous n'avez pas la permission d'accéder à cette page.</p>
      </div>
    </div>
  );
}
export default NonAutorise;