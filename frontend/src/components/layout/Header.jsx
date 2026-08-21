import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';


function Header({ onToggleSidebar, onToggleNotifications }) {

    const { theme, toggleTheme } = useTheme();

    const { notificationsNonLues } = useAuth();

    return (

        <header className="topbar">
      
            <button id="toggleSidebar" onClick={onToggleSidebar}>
                <i className="fas fa-bars"></i>
            </button>
            
            <div className="topbar-actions">
                
                <div>
                    <button className="notificationBtn" onClick={onToggleNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationsNonLues > 0 && ( <span className="notif-badge">{notificationsNonLues}</span> )}
                    </button>
                </div>
                
                <button>
                    <i className="fas fa-shield-alt"></i>
                </button>
                
                <button>
                    <i className="fas fa-cog"></i>
                </button>
                
                <button id="themeToggle" onClick={toggleTheme}>
                    <i className={`fas ${theme === 'clair' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>

            </div>

        </header>
    );
}

export default Header;