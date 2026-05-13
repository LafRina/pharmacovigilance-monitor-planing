import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import './AllUsersPage.css';

export default function AllUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        // Припускаємо, що профілі користувачів лежать у таблиці 'profiles'
        const { data, error } = await supabase
        .from('profiles') 
        .select('email, role');

        if (error) {
            console.error('Помилка завантаження користувачів:', error);
        } else {
            setUsers(data);
        }
        setLoading(false);
    }

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
                        <div key={`${profile.id || index}`} className="user-card">
                            <div className="user-avatar">
                                {profile.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-card">
                                {/* Виводимо email замість імені, оскільки full_name немає */}
                                <h3 className="user-email-title">{profile.email.split('@')[0]}</h3>
                                <p className="user-role-badge">{profile.role}</p>
                                <p className="user-full-email">{profile.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}