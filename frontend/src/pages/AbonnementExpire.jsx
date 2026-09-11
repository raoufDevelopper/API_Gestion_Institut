function AbonnementExpire() {
  
  return (
    <main className="subscription-page">
     
      <div className="subscription-container">
     
        <div className="illustration">
     
          <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" aria-label="Illustration d'un abonnement arrivé à expiration">
            <circle cx="370" cy="250" r="210" className="background-circle" />
            <circle cx="160" cy="140" r="8" className="dot purple" />
            <circle cx="535" cy="130" r="8" className="dot orange" />
            <circle cx="145" cy="345" r="7" className="dot blue" />
            <circle cx="545" cy="360" r="7" className="dot purple" />
            <path d="M205 95 L220 120 L190 120 Z" className="shape-blue" />
            <path d="M510 250 L525 275 L495 275 Z" className="shape-purple" />
            <path d="M330 120 C300 125 285 155 292 190 C295 220 310 235 320 245 L365 210 L390 150 C378 125 355 115 330 120 Z" className="hair" />
            <ellipse cx="345" cy="160" rx="34" ry="40" className="skin" />
            <path d="M310 145 C310 115 350 105 375 125 C390 138 382 160 375 172 C365 155 345 145 325 150 Z" className="hair" />
            <rect x="337" y="190" width="20" height="25" rx="8" className="skin" />
            <path d="M320 205 C295 210 280 235 278 265 L375 265 C372 235 360 210 350 205 Z" className="shirt" />
            <path d="M305 215 C285 220 275 240 292 252 L350 235 L342 220 Z" className="skin" />
            <path d="M352 215 C375 220 390 235 398 248 L380 258 L345 235 Z" className="skin" />
            <path d="M315 235 L385 235 L400 280 L305 280 Z" className="laptop-screen" />
            <path d="M300 280 L405 280 L415 290 L290 290 Z" className="laptop-base" />
            <path d="M350 265 L380 265 L380 350 L350 350 Z" className="pants" />
            <path d="M380 265 L410 265 L430 345 L400 350 Z" className="pants" />
            <path d="M345 345 L380 345 L388 360 L340 360 Z" className="shoe" />
            <path d="M400 340 L430 335 L445 350 L400 355 Z" className="shoe" />
            <path d="M250 300 C250 330 275 350 300 370 C275 390 250 410 250 440 L430 440 C430 410 405 390 380 370 C405 350 430 330 430 300 Z" className="hourglass-glass" />
            <path d="M265 315 L415 315 C410 340 395 350 380 362 L300 362 C285 350 270 340 265 315 Z" className="sand" />
            <path d="M300 378 L380 378 C400 395 415 410 415 430 L265 430 C265 410 280 395 300 378 Z" className="sand" />
            <path d="M340 360 L345 385 L350 360 Z" className="sand" />
            <rect x="235" y="290" width="210" height="20" rx="8" className="hourglass-frame" />
            <rect x="235" y="430" width="210" height="20" rx="8" className="hourglass-frame" />
          </svg>
        </div>
        <section className="subscription-content">
          <h1>ABONNEMENT ARRIVÉ À EXPIRATION</h1>
          <p className="desc">
            Votre période d’abonnement est arrivée à son terme
            et l’accès à cette fonctionnalité n’est plus disponible.
          </p>
          <p className="desc">
            Pour continuer à utiliser l’ensemble des fonctionnalités
            de la plateforme, veuillez renouveler votre abonnement.
          </p>
          <p className="desc">
            Si vous avez déjà effectué un renouvellement, veuillez
            patienter quelques instants ou contacter l’administrateur.
          </p>
          <a href="/abonnement/" className="subscription-button">
            Renouveler mon abonnement
          </a>
        </section>
      </div>
    </main>
  );

}

export default AbonnementExpire;
