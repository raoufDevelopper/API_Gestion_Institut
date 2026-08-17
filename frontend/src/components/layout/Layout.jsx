import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationsModal from './NotificationsModal';


function Layout() {

  const [sidebarFermee, setSidebarFermee] = useState(false);

  const [sidebarAffichee, setSidebarAffichee] = useState(false);

  const [notifOuvertes, setNotifOuvertes] = useState(false);

  const [estDesktop, setEstDesktop] = useState(window.innerWidth > 992);


  useEffect(() => 
    {
      const gererRedimensionnement = () => {
        setEstDesktop(window.innerWidth > 992);
      };

      window.addEventListener('resize', gererRedimensionnement);
      return () => window.removeEventListener('resize', gererRedimensionnement);

    }, []
  );

  const toggleSidebar = () => {
    if (window.innerWidth <= 992) {
      setSidebarAffichee((v) => !v);
    } else {
      setSidebarFermee((v) => !v);
    }
  };

  const fermerSidebarMobile = () => {
    setSidebarAffichee(false);
  };



  return (
    <div className="dashboard">
      
      <Sidebar fermee={sidebarFermee} affichee={sidebarAffichee} />
      
      <main className="main-content" style={estDesktop ? { marginLeft: sidebarFermee ? '0' : '230px' } : undefined}>
        <Header onToggleSidebar={toggleSidebar} onToggleNotifications={() => setNotifOuvertes(true)}/>
        <div className="sous-main">
          <Outlet />
        </div>
      </main>

      <NotificationsModal ouvert={notifOuvertes} onFermer={() => setNotifOuvertes(false)} />
      
      {(notifOuvertes || sidebarAffichee) && (
        <div
          id="overlay"
          className="show"
          onClick={() => {
            setNotifOuvertes(false);
            fermerSidebarMobile();
          }}
        />
      )}

    </div>

  );

}

export default Layout;