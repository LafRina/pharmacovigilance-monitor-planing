import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import AdminTasksView from './AdminTasksView';
import ActiveRegulations from '../Common/ActiveRegulations';
import GeneralInfoBlock from '../Common/GeneralInfoBlock';

// Додаємо userRole у деструктуризацію пропсів
export default function AdminDashboard({ user, userRole }) {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <button className='add-drugs-btn' onClick={() => navigate('/create-task')}>
                        +
                    </button>
                </div>
            </header>

            {/* ПЕРЕДАЄМО ПРОПСИ ТУТ: без них картки не знатимуть, чиї дані рахувати */}
            <GeneralInfoBlock user={user} userRole={userRole} />

            <ActiveRegulations userRole={userRole} currentUserId={user?.id} />

            <AdminTasksView />
        </div>
    );
}