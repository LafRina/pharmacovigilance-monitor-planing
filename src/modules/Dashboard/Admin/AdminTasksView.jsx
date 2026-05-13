import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabaseClient';
import './AdminTasksView.css';

export default function AdminTasksView() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Стан для фільтрів
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    const fetchAdminTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    profiles:assigned_to (email)
                `)
                .is('drug_id', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Помилка завантаження завдань:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminTasks();

        const channel = supabase
            .channel('admin-tasks-realtime')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'tasks' }, 
                () => fetchAdminTasks()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // 1. Отримуємо список унікальних емейлів для фільтра
    const uniqueUsers = [...new Set(tasks.map(t => t.profiles?.email))].filter(Boolean);

    // 2. Логіка фільтрації
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesUser = userFilter === 'all' || task.profiles?.email === userFilter;
        return matchesStatus && matchesUser;
    });

    if (loading) return <div>Завантаження списку завдань...</div>;

    return (
        <div className="admin-tasks-container">
            <div className="admin-tasks-header-row">
                <h2>Моніторинг завдань</h2>
                
                {/* Панель фільтрів */}
                <div className="table-filters">
                    <div className="filter-group">
                        <label>Статус:</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Усі статуси</option>
                            <option value="To Do">Очікує (To Do)</option>
                            <option value="In Progress">У роботі (In Progress)</option>
                            <option value="Done">Виконано (Done)</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Виконавець:</label>
                        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                            <option value="all">Усі працівники</option>
                            {uniqueUsers.map(email => (
                                <option key={email} value={email}>{email}</option>
                            ))}
                        </select>
                    </div>

                    {(statusFilter !== 'all' || userFilter !== 'all') && (
                        <button className="reset-link" onClick={() => { setStatusFilter('all'); setUserFilter('all'); }}>
                            Скинути
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-tasks-table-wrapper">
                <table className="admin-tasks-table">
                    <thead>
                        <tr className='admin-tasks-table-header'>
                            <th>Назва</th>
                            <th>Виконавець</th>
                            <th>Дедлайн</th>
                            <th>Пріоритет</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((task) => (
                            <tr key={task.id}>
                                <td>{task.title}</td>
                                <td className="user-email-cell">{task.profiles?.email}</td>
                                <td>{new Date(task.due_date).toLocaleDateString('uk-UA')}</td>
                                <td>
                                    <span className={`prio-tag ${task.priority?.toLowerCase()}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-tag ${task.status?.replace(' ', '-').toLowerCase()}`}>
                                        {task.status === 'Done' ? 'Виконано' : 
                                         task.status === 'In Progress' ? 'У роботі' : 'Очікує'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTasks.length === 0 && (
                    <div className="no-results">Завдань за такими критеріями не знайдено</div>
                )}
            </div>
        </div>
    );
}