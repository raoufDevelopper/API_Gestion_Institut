function NonAutorise() {
  return (
    <main className="access-page">
      
      <div className="access-container">
        
        <div className="illustration">
          <svg viewBox="0 0 600 350" xmlns="http://www.w3.org/2000/svg" aria-label="Illustration d'accès refusé">
            <circle cx="365" cy="105" r="72" className="moon" />
            <path d="M60 270 L180 125 L235 195 L310 95 L440 270 Z" className="mountain-back" />
            <path d="M125 280 L285 105 L365 190 L445 95 L550 280 Z" className="mountain-main" />
            <path d="M285 105 L365 190 L445 95 L425 130 L365 185 L320 145 Z" className="snow" />
            <path d="M95 250 C110 220 145 220 160 245 C175 215 220 215 235 250 C255 235 290 245 295 275 L85 275 Z" className="cloud" />
            <path d="M350 260 C365 225 405 225 420 250 C440 215 485 220 500 255 C525 240 555 250 560 280 L340 280 Z" className="cloud" />
            <path d="M125 95 Q140 82 155 95 Q170 82 185 95" className="bird" />
            <path d="M390 70 Q402 60 414 70 Q426 60 438 70" className="bird" />
          </svg>
        </div>
        
        <section className="access-content">
          <h1>ACCÈS REFUSÉ</h1>
          <p className="desc">
              Vous n’êtes pas autorisé à accéder à cette page.
              Cette ressource est réservée aux utilisateurs disposant
              des permissions nécessaires.
          </p>
          <p className="desc">
              Si vous pensez que cette restriction est une erreur,
              veuillez contacter l’administrateur du système afin
              de vérifier vos droits d’accès.
          </p>
          <a href="/dashboard/" className="dashboard-button">
              <span className="arrow">←</span>
              Retour au tableau de bord
          </a>
        </section>

      </div>
    
    </main>
  );
}
export default NonAutorise;