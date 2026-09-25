function ToggleVue({ vue, onChange }) 
{
  return (
    <button className="toggle-vue-btn" onClick={() => onChange(vue === 'tableau' ? 'bloc' : 'tableau')} title="Changer l'affichage">
      <i className={`fas ${vue === 'tableau' ? 'fa-grip' : 'fa-table-list'}`}></i>
    </button>
  );
}


export default ToggleVue;
