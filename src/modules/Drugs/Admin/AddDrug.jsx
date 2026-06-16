import { supabase } from "../../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUsers } from '../../../hooks/useUsers';
import { useDrugActions } from '../../../hooks/useDrugActions';
// import { logAction } from "../../../utils/audit";
import { logAction } from "../../../utils/audit";
import { calculateNextDates } from "../../../utils/dateLogic";
import { findBestSubstanceMatch } from "../../../utils/substancePicker";
import AddDrugInput from "./AddDrugInput";
import './AddDrug.css';

export default function AddDrug({ user }) {
    const navigate = useNavigate();
    const { users } = useUsers();
    const { createDrugWithSchedule } = useDrugActions();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        trade_name: '', active_substance: '', form_of_release: '',
        registration_number: '', registration_date: '', expiration_date: '',
        manufacturer: '', applicant: '', assigned_to: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.assigned_to) return alert('Оберіть відповідального');
        
        setLoading(true);
        try {
            console.log("Натиснуто кнопку збереження...");
            await createDrugWithSchedule(formData, user.id, user.email);
            alert('Препарат та графік успішно створено!');
            navigate('/drugslist');
        } catch (err) {
            alert('Помилка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="add-drug-container">
            <button className="back-btn" onClick={() => navigate('/drugslist')}>← Назад</button>

            <div className="add-drug-card">
                <h2>Додати новий препарат</h2>
                <form onSubmit={handleSubmit} className="drug-form">
                    
                    <div className="calculation-box" style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', border: '1px solid #cce3ff', marginBottom: '20px' }}>
                        <label className="input-label">Відповідальний за фармаконагляд</label>
                        <select 
                            name="assigned_to" 
                            className="form-select" 
                            onChange={handleChange}
                            value={formData.assigned_to}
                            required
                        >
                            <option value="">-- Оберіть працівника --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            * Графік PSUR буде розраховано автоматично після натискання кнопки збереження.
                        </p>
                    </div>

                    <AddDrugInput label="Торгова назва" name='trade_name' value={formData.trade_name} onChange={handleChange} required />
                    <AddDrugInput label="Діюча речовина" name='active_substance' value={formData.active_substance} onChange={handleChange} required />
                    <AddDrugInput label="Форма випуску" name='form_of_release' value={formData.form_of_release} onChange={handleChange} />
                    <AddDrugInput label="Номер реєстрації" name='registration_number' value={formData.registration_number} onChange={handleChange} required />
                    <AddDrugInput label="Дата реєстрації" name='registration_date' type="date" value={formData.registration_date} onChange={handleChange} />
                    <AddDrugInput label="Термін дії" name='expiration_date' value={formData.expiration_date} onChange={handleChange} required />
                    <AddDrugInput label="Виробник" name='manufacturer' value={formData.manufacturer} onChange={handleChange} />
                    <AddDrugInput label="Заявник" name='applicant' value={formData.applicant} onChange={handleChange} />
                    
                    <button type="submit" className="submit-drug-btn" style={{ marginTop: '20px' }}>
                        Зберегти препарат та створити графік
                    </button>                
                </form>
            </div>
        </div>
    );
}
