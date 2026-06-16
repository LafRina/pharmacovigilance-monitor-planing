import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { useReports } from '../../hooks/useReports';
import { supabase } from '../../api/supabaseClient';
import '../Drugs/Admin/AddDrug.css';



export default function GenerateReport() {
    const navigate = useNavigate();
    const { users } = useUsers();
    const { generateAndSaveReport } = useReports();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_email: '', start_date: '', end_date: '', task_type: 'all'
    });

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Отримуємо ID поточного адміна через supabase.auth
            const { data: { user } } = await supabase.auth.getUser();
            await generateAndSaveReport(formData, user.id);
            alert('Звіт успішно згенеровано!');
            navigate('/reports');
        } catch (err) {
            alert("Помилка: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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

