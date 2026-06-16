import { useState } from 'react';
import { supabase } from '../../../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../../hooks/useUsers';
import AddDrugInput from '../../Drugs/Admin/AddDrugInput';
import FormSelect from '../../../components/common/FormSelect';
import './AdminCreateTask.css';

export default function AdminCreateTask({ adminUser }) {
    const navigate = useNavigate();
    const { users } = useUsers();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', 
        description: '', 
        due_date: '', 
        assigned_to: '', 
        priority: 'Medium'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('tasks').insert([{
                ...formData,
                created_by: adminUser.id,
                status: 'To Do'
            }]);
            if (error) throw error;
            navigate(-1);
        } catch (err) {
            alert('Помилка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-drug-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Назад до панелі
            </button>

            <div className="add-drug-card">
                <h2 className="form-title" style={{marginBottom: '30px'}}>Створити нове завдання</h2>
                
                <form onSubmit={handleSubmit} className="drug-form">
                    <AddDrugInput 
                        name="title" 
                        placeholder="Назва завдання" 
                        value={formData.title}
                        onChange={handleChange} 
                        required 
                    />
                    
                    <FormSelect 
                        name="assigned_to" 
                        label="Виконавець"
                        value={formData.assigned_to} 
                        onChange={handleChange} 
                        options={users} 
                        required
                    />

                    <div className="form-row">
                        <AddDrugInput 
                            label="Виконати до"
                            type="date" 
                            name="due_date" 
                            value={formData.due_date}
                            onChange={handleChange} 
                            required 
                        />

                        <FormSelect 
                            label="Пріоритет"
                            name="priority" 
                            value={formData.priority} 
                            onChange={handleChange}
                            options={[
                                {value: 'Low', label: 'Low'},
                                {value: 'Medium', label: 'Medium'},
                                {value: 'High', label: 'High'}
                            ]}
                        />
                    </div>

                    <div className="textarea-stack">
                        <textarea 
                            name="description" 
                            className="form-textarea"
                            placeholder="Опис завдання..." 
                            value={formData.description}
                            onChange={handleChange}
                            style={{minHeight: '150px'}}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-drug-btn" disabled={loading}>
                        {loading ? 'Збереження...' : 'Призначити завдання'}
                    </button>
                </form>
            </div>
        </div>
    );
    
}
