import { useEffect, useState } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { differenceInDays, parseISO } from 'date-fns';
import './ActiveRegulations.css';
import '../Admin/AdminTasksView.css';

export default function ActiveRegulations({ userRole, currentUserId }) {
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Стан для фільтрів
    const [dlpStatusFilter, setDlpStatusFilter] = useState('all'); // Новий фільтр для DLP
    const [deadlineStatusFilter, setDeadlineStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    const fetchRegsAndTasks = async () => {
        try {
            let { data: regs, error: regsError } = await supabase
                .from('active_regulations')
                .select(`
                    id, drug_id, type_doc, dlp_date, submission_deadline, assigned_to,
                    drugs (trade_name),
                    assigned_profile:assigned_to (email)
                `)
                .order('submission_deadline', { ascending: true });

            if (regsError) throw regsError;

            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('title, status, drug_id')
                .not('drug_id', 'is', null);

            if (tasksError) throw tasksError;

            if (userRole !== 'admin' && currentUserId) {
                regs = regs.filter(r => r.assigned_to === currentUserId);
            }

            const combined = regs.map(reg => ({
                ...reg,
                dlpTaskStatus: tasks.find(t => t.drug_id === reg.drug_id && t.title.includes('DLP'))?.status || 'To Do',
                deadlineTaskStatus: tasks.find(t => t.drug_id === reg.drug_id && t.title.includes('Deadline'))?.status || 'To Do'
            }));

            setRegulations(combined);
        } catch (err) {
            console.error("Помилка завантаження даних:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegsAndTasks();
        const channel = supabase
            .channel('status-updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, fetchRegsAndTasks)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [currentUserId]);

    const uniqueUsers = [...new Set(regulations.map(r => r.assigned_profile?.email))].filter(Boolean);

    // Логіка фільтрації з урахуванням статусу DLP
    const filteredRegulations = regulations.filter(reg => {
        const matchesDlpStatus = dlpStatusFilter === 'all' || reg.dlpTaskStatus === dlpStatusFilter;
        const matchesDeadlineStatus = deadlineStatusFilter === 'all' || reg.deadlineTaskStatus === deadlineStatusFilter;
        const matchesUser = userFilter === 'all' || reg.assigned_profile?.email === userFilter;
        return matchesDlpStatus && matchesDeadlineStatus && matchesUser;
    });

    const getDaysLeft = (targetDate) => {
        const days = differenceInDays(parseISO(targetDate), new Date());
        if (days < 0) return { text: `${Math.abs(days)} дн. тому`, statusClass: 'overdue' };
        if (days <= 14) return { text: `${days} дн.`, statusClass: 'urgent' };
        return { text: `${days} дн.`, statusClass: 'normal' };
    };

    const renderStatusBadge = (status) => {
        const map = {
            'Done': { text: 'Виконано', class: 'done' },
            'In Progress': { text: 'У роботі', class: 'process' },
            'To Do': { text: 'Очікує', class: 'todo' }
        };
        const config = map[status] || map['To Do'];
        return <span className={`status-tag ${config.class}`}>{config.text}</span>;
    };

    if (loading) return <div>Завантаження регламентів...</div>;

    return (
        <div className="admin-tasks-container">
            <h2>Активні регламенти (PSUR)</h2>                
            {loading ? (
                <div className="loading-message">Завантаження регламентів...</div>
            ) : regulations.length > 0 ? (
                <>
            <header className="regulations-header-row">
                    <div className="table-filters">
                        {/* Фільтр статус DLP */}
                        <div className="filter-group">
                            <label>Статус DLP:</label>
                            <select value={dlpStatusFilter} onChange={(e) => setDlpStatusFilter(e.target.value)}>
                                <option value="all">Усі</option>
                                <option value="To Do">Очікує</option>
                                <option value="In Progress">У роботі</option>
                                <option value="Done">Виконано</option>
                            </select>
                        </div>

                        {/* Фільтр статус Дедлайну */}
                        <div className="filter-group">
                            <label>Статус дедлайну:</label>
                            <select value={deadlineStatusFilter} onChange={(e) => setDeadlineStatusFilter(e.target.value)}>
                                <option value="all">Усі</option>
                                <option value="To Do">Очікує</option>
                                <option value="In Progress">У роботі</option>
                                <option value="Done">Виконано</option>
                            </select>
                        </div>

                        {userRole === 'admin' && (
                            <div className="filter-group">
                                <label>Відповідальний:</label>
                                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                                    <option value="all">Усі працівники</option>
                                    {uniqueUsers.map(email => (
                                        <option key={email} value={email}>{email}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {(dlpStatusFilter !== 'all' || deadlineStatusFilter !== 'all' || userFilter !== 'all') && (
                            <button 
                                className="reset-link" 
                                onClick={() => { setDlpStatusFilter('all'); setDeadlineStatusFilter('all'); setUserFilter('all'); }}
                            >
                                Скинути
                            </button>
                        )}
                    </div>
            </header>

            <div className="admin-tasks-table-wrapper">
                <table className="admin-tasks-table">
                    <thead>
                        <tr className='admin-tasks-table-header'>
                            <th>Препарат</th>
                            <th>Тип</th>
                            <th>DLP</th>
                            <th>До DLP</th>
                            <th>Статус DLP</th>
                            <th>Дедлайн</th>
                            <th>До дедлайну</th>
                            <th>Статус дедлайну</th>
                            <th>Відповідальний</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegulations.map((reg) => {
                            const dlpInfo = getDaysLeft(reg.dlp_date);
                            const deadlineInfo = getDaysLeft(reg.submission_deadline);
                            return (
                                <tr key={reg.id}>
                                    <td className="drug-name">{reg.drugs?.trade_name}</td>
                                    <td>{reg.type_doc}</td>
                                    <td>{reg.dlp_date}</td>
                                    <td className={dlpInfo.statusClass}>{dlpInfo.text}</td>
                                    <td>{renderStatusBadge(reg.dlpTaskStatus)}</td>
                                    <td className="bold">{reg.submission_deadline}</td>
                                    <td className={deadlineInfo.statusClass}>{deadlineInfo.text}</td>
                                    <td>{renderStatusBadge(reg.deadlineTaskStatus)}</td>
                                    <td className="user-email">{reg.assigned_profile?.email}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            </>
            ) : (
                // ЯКЩО ДАНИХ НЕМАЄ — показуємо ваше повідомлення
                <div className="empty-state-container">
                    <p className="empty-state-text">Для вас ще немає активних регламентів</p>
                </div>
            )}
        </div>
    );
}