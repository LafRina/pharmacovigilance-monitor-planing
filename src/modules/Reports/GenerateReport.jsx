import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../Drugs/AddDrug.css'; // Використовуємо існуючі стилі для ідентичного вигляду

export default function GenerateReport() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_email: '',
        start_date: '',
        end_date: '',
        task_type: 'all'
    });

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await supabase.from('profiles').select('email');
            setUsers(data || []);
        }
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.user_email || !formData.start_date || !formData.end_date) {
            return alert("Будь ласка, заповніть усі поля фільтрації");
        }

        setLoading(true);
        try {
            // 1. Пошук завдань
            let query = supabase
                .from('tasks')
                .select(`
                    *,
                    profiles:assigned_to!inner(email)
                `)
                .eq('profiles.email', formData.user_email)
                .gte('due_date', formData.start_date)
                .lte('due_date', formData.end_date);

            if (formData.task_type === 'psur') query = query.ilike('title', '%PSUR%');
            if (formData.task_type === 'regular') query = query.not('title', 'ilike', '%PSUR%');

            const { data: foundTasks, error } = await query;
            if (error) throw error;

            // 2. Збереження звіту
            const { error: saveError } = await supabase.from('reports').insert({
                report_name: `Звіт по активності`,
                user_email: formData.user_email,
                period_start: formData.start_date,
                period_end: formData.end_date,
                task_type: formData.task_type,
                data: foundTasks,
                created_by: (await supabase.auth.getUser()).data.user.id
            });

            if (saveError) throw saveError;

            alert('Звіт успішно згенеровано та збережено!');
            navigate('/reports');
        } catch (err) {
            alert("Помилка: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-drug-container">
            <button className="back-btn" onClick={() => navigate('/reports')}>← Назад до звітів</button>

            <div className="add-drug-card">
                <h2>Генерація нового звіту</h2>
                
                <form onSubmit={handleGenerate} className="drug-form">
                    <div className="calculation-box" style={{ background: '#f8f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #e0e7ff', marginBottom: '25px' }}>
                        <label className="input-label">Оберіть користувача</label>
                        <select 
                            name="user_email" 
                            className="form-select" 
                            onChange={handleChange}
                            value={formData.user_email}
                            required
                        >
                            <option value="">-- Оберіть емейл --</option>
                            {users.map(u => (
                                <option key={u.email} value={u.email}>{u.email}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Період з:</label>
                            <input 
                                type="date" 
                                name="start_date"
                                className="form-input" 
                                value={formData.start_date}
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">по:</label>
                            <input 
                                type="date" 
                                name="end_date"
                                className="form-input" 
                                value={formData.end_date}
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    <div className="filter-group" style={{ marginBottom: '25px' }}>
                        <label className="input-label">Які саме завдання:</label>
                        <select 
                            name="task_type" 
                            className="form-select" 
                            value={formData.task_type}
                            onChange={handleChange}
                        >
                            <option value="all">Усі (PSUR + Звичайні)</option>
                            <option value="psur">Тільки PSUR</option>
                            <option value="regular">Тільки звичайні завдання</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-drug-btn" disabled={loading}>
                        {loading ? 'Генерація...' : 'Згенерувати та зберегти звіт'}
                    </button>
                </form>
            </div>
        </div>
    );
}