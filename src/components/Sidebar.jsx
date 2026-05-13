import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient.js';
import SidebarSection from './SidebarSection.jsx';

// Іконки (переконайся, що шляхи правильні)
import calendarIcon from '../icons/calendar-icon.png';
import compassIcon from '../icons/compass-icon.png';
import folderIcon from '../icons/folder-icon.png';
import reportsIcon from '../icons/reports-icon.png';
import personIcon from '../icons/person-icon.png';

import './Sidebar.css';

export default function Sidebar({ userEmail, userRole, isRoleLoading }) {
    const navigate = useNavigate();

    // Локальні стани, щоб інтерфейс не "блимав" при переходах
    const [localEmail, setLocalEmail] = useState(userEmail);
    const [localRole, setLocalRole] = useState(userRole);

    useEffect(() => {
        // Синхронізація локального стану з пропсами від App.js
        if (userEmail) {
            setLocalEmail(userEmail);
        } else if (!isRoleLoading) {
            // Якщо пропс порожній, але завантаження завершено - ставимо Гість
            setLocalEmail(null);
        }
    
        if (userRole) {
            setLocalRole(userRole);
        }
    }, [userEmail, userRole, isRoleLoading]); // Додаємо залежності

    async function handleLogout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Помилка виходу:', error.message);
        } else {
            navigate('/login');
        }
    }

    return (
        <div className='sidebar'>
            <div className='sidebar-logo'>M&P PHARMA</div>

            <nav className='nav-sidebar'>
                {/* ГРУПА: ГОЛОВНА */}
                {localRole === 'admin' ? (
                    <SidebarSection to='/admindashboard' icon={compassIcon} end>
                        Головна (Адмін)
                    </SidebarSection>
                ) : (
                    <SidebarSection to='/userdashboard' icon={compassIcon} end>
                        Головна (Юзер)
                    </SidebarSection>
                )}

                {/* КАЛЕНДАР */}
                {localRole === 'user' && (
                    <SidebarSection to='/usercalendar' icon={calendarIcon}>
                        Календар
                    </SidebarSection>
                )}
                {/* <SidebarSection 
                    to={localRole === 'admin' ? '/admincalendar' : '/usercalendar'} 
                    icon={calendarIcon}
                >
                    Календар
                </SidebarSection> */}

                {/* ГРУПА: СПІЛЬНІ РОЗДІЛИ */}
                <SidebarSection to='/drugslist' icon={folderIcon}>
                    Реєстр препаратів
                </SidebarSection>
                
                {localRole === 'admin' && (
                    <SidebarSection to='/reports' icon={reportsIcon}>
                        Звіти
                    </SidebarSection>
                )}

                {/* ГРУПА: ТІЛЬКИ ДЛЯ АДМІНА */}
                {localRole === 'admin' && (
                    <SidebarSection to='/allusers' icon={personIcon}>
                        Користувачі
                    </SidebarSection>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {localEmail ? localEmail.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="user-details">
                        <p className="user-name">
                            {localEmail || (isRoleLoading ? "Завантаження..." : "Гість")}
                        </p>
                        <button onClick={handleLogout} className="logout-btn">
                            Вийти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}