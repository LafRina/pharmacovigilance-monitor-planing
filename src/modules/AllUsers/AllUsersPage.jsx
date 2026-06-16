import { useUsers } from '../../hooks/useUsers';
import './AllUsersPage.css';

export default function AllUsersPage() {
    // Дістаємо дані та стан завантаження прямо з хука
    const { users, loading } = useUsers(); 

    return (
        <div className="users-page-container">
            <div className="users-header">
                <h2>Користувачі системи</h2>
                <span className="user-count">Всього: {users.length}</span>
            </div>

            {loading ? (
                <div className="loading-state">Завантаження списку...</div>
            ) : (
                <div className="users-grid">
                    {users.map((profile, index) => (
                        <div key={profile.id || index} className="user-card">
                            <div className="user-avatar">
                                {profile.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-card">
                                {/* Виводимо частину email як ім'я */}
                                <h3 className="user-email-title">{profile.email.split('@')[0]}</h3>
                                <p className={`user-role-badge role-${profile.role}`}>
                                    {profile.role}
                                </p>
                                <p className="user-full-email">{profile.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
