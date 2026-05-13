import TaskCard from '../Common/TaskCard.jsx'; // Переконайся, що шлях правильний
import './UserDashboard.css';
import ActiveRegulations from '../Common/ActiveRegulations.jsx';
import GeneralInfoBlock from '../Common/GeneralInfoBlock.jsx';

export default function UserDashboard({ user, userRole }) {

    return (
        <div className="dashboard-container">
            <main className="dashboard-main-content">
                <GeneralInfoBlock user={user} userRole={userRole} />
                <section className="active-regs-section">
                    {/* Передаємо роль 'user' */}
                    <ActiveRegulations userRole="user" currentUserId={user?.id} />
                </section>
                <section >
                    {/* Передаємо роль 'user' */}
                    <TaskCard user={user} />
                </section>
            </main>
        </div>
    );
}