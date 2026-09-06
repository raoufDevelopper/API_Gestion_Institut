function Loader({ label }) {
  return (
    <div className="loader-conteneur">
      <div className="loader-spinner">
        <div className="loader-point"></div>
      </div>
      {label && <div className="loader-label">{label}</div>}
    </div>
  );
}
export default Loader;