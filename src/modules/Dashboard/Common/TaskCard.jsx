import { useState } from 'react';
// import { supabase } from '../../../api/supabaseClient';
import './TaskCard.css';
import { useUserTasks } from '../../../hooks/useUserTasks';

export default function TaskCard({ user }) {
    // Отримуємо дані та функції з хука
    const { tasks, loading, updateTaskStatus } = useUserTasks(user?.id);

    // Локальний стан для фільтрів
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Обробник зміни статусу використовує функцію з хука
    const handleStatusChange = async (taskId, newStatus, drugId) => {
        try {
            await updateTaskStatus(taskId, newStatus, drugId);
        } catch (err) {
            alert("Не вдалося оновити статус: " + err.message);
        }
    };

    // Логіка фільтрації
    const filteredTasks = tasks.filter(task => {
        const isPsur = task.title?.includes('PSUR');
        
        const matchesType = 
            typeFilter === 'all' || 
            (typeFilter === 'psur' && isPsur) || 
            (typeFilter === 'regular' && !isPsur);

        const matchesDate = !dateFilter || task.due_date === dateFilter;

        return matchesType && matchesDate;
    });

    // Обробка станів завантаження
    if (loading && !user?.id) return <div className="loader">Очікування авторизації...</div>;
    if (loading) return <div className="loader">Завантаження завдань з бази...</div>;

    return (
        <div className="tasks-container">
            <header className="regulations-header-row">
                <h2 className="tasks-title">Мої завдання</h2>

                <div className="table-filters" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div className="filter-group">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Тип завдання:</label>
                        <select 
                            value={typeFilter} 
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="all">Усі завдання</option>
                            <option value="psur">Тільки PSUR</option>
                            <option value="regular">Звичайні завдання</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Дата дедлайну:</label>
                        <input 
                            type="date" 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{ padding: '7px', borderRadius: '6px', border: '1px solid #ddd' }}
                        />
                    </div>

                    {(typeFilter !== 'all' || dateFilter !== '') && (
                        <button 
                            onClick={() => { setTypeFilter('all'); setDateFilter(''); }}
                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', paddingBottom: '10px' }}
                        >
                            Скинути
                        </button>
                    )}
                </div>
            </header>

            <div className="tasks-grid">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                        const isPsur = task.title?.includes('PSUR');
                        const formattedDate = new Date(task.due_date).toLocaleDateString('uk-UA');

                        return (
                            <div key={task.id} className={`task-card ${isPsur ? 'psur-card' : ''}`}>
                                <h3 className="task-name">
                                    {isPsur 
                                        ? `${task.title} - ${formattedDate}` 
                                        : task.title
                                    }
                                </h3>
                                
                                <div className="task-badges-row">
                                    <select 
                                        className={`status-select-badge status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value, task.drug_id)}
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>

                                    {!isPsur && task.priority && (
                                        <div className="priority-display-badge">
                                            {task.priority}
                                        </div>
                                    )}
                                </div>
                                
                                {!isPsur && (
                                    <p className="task-deadline">
                                        Виконати до: {formattedDate}
                                    </p>
                                )}
                                
                                {!isPsur && (
                                    <div className="task-description-block">
                                        <h4 className="description-label">Опис:</h4>
                                        <p className="task-description-text">
                                            {task.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-tasks" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#888' }}>
                        Завдань не знайдено
                    </div>
                )}
            </div>
        </div>
    );
}

