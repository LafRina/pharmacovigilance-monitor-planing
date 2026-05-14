import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../api/supabaseClient';
import { useUsers } from '../../../hooks/useUsers';
import { useDrugActions } from '../../../hooks/useDrugActions';
// import { calculateNextDates } from "../../../utils/dateLogic";
// import { findBestSubstanceMatch } from "../../../utils/substancePicker";
import AddDrugInput from './AddDrugInput';
import './AddDrug.css';

export default function EditDrug({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Отримуємо користувачів та дії з препаратами через хуки
    const { users } = useUsers(); 
    const { updateDrug, createSchedule } = useDrugActions();
    
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDrug() {
            const { data, error } = await supabase
                .from('drugs')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error('Помилка завантаження:', error);
                navigate('/drugslist');
            } else {
                setFormData(data);
            }
            setLoading(false);
        }
        fetchDrug();
    }, [id, navigate]);

    // функція обробки змін
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculateSchedule = async () => {
        if (!formData.assigned_to) return alert('Оберіть відповідального!');
        try {
            const { nextDlp, nextDeadline } = await createSchedule(id, formData, user.id);
            alert(`Графік розраховано!\nDLP: ${nextDlp}\nDeadline: ${nextDeadline}`);
        } catch (err) { 
            alert('Помилка розрахунку: ' + err.message); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDrug(id, formData, user.id, user.email);
            alert('Дані успішно оновлено!');
            navigate(`/drugs/${id}`);
        } catch (err) { 
            alert('Помилка при збереженні: ' + err.message); 
        }
    };

    if (loading) return <div className="loading-state">Завантаження...</div>;

    return (
        <div className="add-drug-container">
            <button className="back-btn" onClick={() => navigate(`/drugs/${id}`)}>← Назад</button>

            <div className="add-drug-card">
                <h2>Редагування: {formData?.trade_name}</h2>
                
                {/* Блок планування */}
                <div className="calculation-box" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e9ecef' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Планування фармаконагляду</h4>
                    <div className="input-group" style={{ marginBottom: '15px' }}>
                        <label className="input-label">Відповідальний працівник</label>
                        <select 
                            name="assigned_to" 
                            className="form-select" 
                            onChange={handleChange} 
                            value={formData?.assigned_to || ''}
                        >
                            <option value="">-- Оберіть користувача --</option>
                            {users && users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        type="button" 
                        onClick={handleCalculateSchedule} 
                        className="calculate-btn" 
                        style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        ⚙️ Розрахувати графік та створити таски
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="drug-form">
                    <AddDrugInput 
                        label="Торгова назва" 
                        name='trade_name' 
                        value={formData?.trade_name || ''} 
                        onChange={handleChange} 
                        required 
                    />
                    <AddDrugInput 
                        label="Діюча речовина" 
                        name='active_substance' 
                        value={formData?.active_substance || ''} 
                        onChange={handleChange} 
                    />
                    <AddDrugInput 
                        label="Форма випуску" 
                        name='form_of_release' 
                        value={formData?.form_of_release || ''} 
                        onChange={handleChange} 
                    />
                    <AddDrugInput 
                        label="Виробник" 
                        name='manufacturer' 
                        value={formData?.manufacturer || ''} 
                        onChange={handleChange} 
                    />
                    <AddDrugInput 
                        label="Заявник" 
                        name='applicant' 
                        value={formData?.applicant || ''} 
                        onChange={handleChange} 
                    />
                    
                    <div style={{ marginTop: '20px' }}>
                        <button type="submit" className="submit-drug-btn">
                            Зберегти зміни в реєстрі
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// export default function EditDrug({ user }) {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [usersList, setUsersList] = useState([]);

//     useEffect(() => {
//         fetchDrug();
//         fetchUsers();
//     }, [id]);

//     async function fetchUsers() {
//         const { data, error } = await supabase.from('profiles').select('id, email');
//         if (error) console.error("Помилка завантаження користувачів:", error);
//         if (data) setUsersList(data);
//     }

//     async function fetchDrug() {
//         const { data, error } = await supabase
//             .from('drugs')
//             .select('*')
//             .eq('id', id)
//             .single();

//         if (error) {
//             console.error('Помилка завантаження:', error);
//             navigate('/drugslist');
//         } else {
//             setFormData(data);
//         }
//         setLoading(false);
//     }

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleCalculateSchedule = async () => {
//         // 1. Перевірка наявності відповідального
//         if (!formData.assigned_to) {
//             alert('Спершу оберіть відповідального працівника у списку зверху!');
//             return;
//         }
    
//         try {
//             // 2. Використовуємо вашу логіку пріоритетного пошуку (моно -> комбо)
//             const substanceName = formData.active_substance?.trim();
//             const substance = await findBestSubstanceMatch(substanceName);
    
//             if (!substance) {
//                 alert(`Діючу речовину "${substanceName}" не знайдено в довіднику.`);
//                 return;
//             }
    
//             // 3. Використовуємо вашу логіку розрахунку (70/90 днів + перевірка на вихідні)
//             // Функція calculateNextDates вже повертає дати, скориговані на П'ятницю
//             const { nextDlp, nextDeadline } = calculateNextDates(substance.dlp, substance.frequency);

//             const { error: regError } = await supabase
//             .from('active_regulations')
//             .insert([
//                 {
//                     drug_id: id, // або newDrug.id для AddDrug
//                     assigned_to: formData.assigned_to,
//                     type_doc: formData.report_type || 'PSUR',
//                     dlp_date: nextDlp,
//                     submission_deadline: nextDeadline,
//                     status: 'В роботі',
//                     periodicity: substance.frequency,
//                     created_by: user.id
//                 }
//             ]);

//             if (regError) throw regError;
    
//             // 4. Формуємо таски з правильними статусами та полями
//             const tasks = [
//                 {
//                     title: `PSUR ${formData.trade_name}: DLP`,
//                     description: `Точка відсікання даних — ${nextDlp}`,
//                     due_date: nextDlp,
//                     drug_id: id,
//                     assigned_to: formData.assigned_to,
//                     created_by: user.id,
//                     status: 'To Do'
//                 },
//                 {
//                     title: `PSUR ${formData.trade_name}: Deadline`,
//                     description: `Гранична дата подання — ${nextDeadline}`,
//                     due_date: nextDeadline,
//                     drug_id: id,
//                     assigned_to: formData.assigned_to,
//                     created_by: user.id,
//                     status: 'To Do'
//                 }
//             ];
    
//             const { error: taskError } = await supabase.from('tasks').insert(tasks);
//             if (taskError) throw taskError;

//             alert(`Графік розраховано!\nДані внесено в Регламенти та Календар.\nDLP: ${nextDlp}\nDeadline: ${nextDeadline}`);
            
//         } catch (err) {
//             alert('Помилка: ' + err.message);
//         }
//     };

//     async function handleSubmit(e) {
//         e.preventDefault();
        
//         if (!user) {
//             alert("Помилка: користувач не авторизований");
//             return;
//         }
    
//         try {
//             // 1. Отримуємо старі дані перед оновленням для аудиту
//             const { data: oldData } = await supabase
//                 .from('drugs')
//                 .select('*')
//                 .eq('id', id)
//                 .single();
    
//             // 2. Виконуємо оновлення
//             const { error: updateError } = await supabase
//                 .from('drugs')
//                 .update(formData)
//                 .eq('id', id);
    
//             if (updateError) throw updateError;
    
//             // 3. Формуємо деталі для аудиту (що саме змінилося)
//             const auditDetails = {
//                 trade_name: formData.trade_name,
//                 changes: {
//                     from: {
//                         trade_name: oldData.trade_name,
//                         active_substance: oldData.active_substance,
//                         form_of_release: oldData.form_of_release,
//                         manufacturer: oldData.manufacturer,
//                         applicant: oldData.applicant
//                     },
//                     to: {
//                         trade_name: formData.trade_name,
//                         active_substance: formData.active_substance,
//                         form_of_release: formData.form_of_release,
//                         manufacturer: formData.manufacturer,
//                         applicant: formData.applicant
//                     }
//                 }
//             };
    
//             // 4. Записуємо в аудит
//             await logAction(
//                 user.id, 
//                 user.email, 
//                 'UPDATE', 
//                 'drugs', 
//                 id, 
//                 auditDetails
//             );
    
//             alert('Дані успішно оновлено!');
//             navigate(`/drugs/${id}`);
            
//         } catch (err) {
//             console.error(err);
//             alert('Помилка при збереженні: ' + err.message);
//         }
//     }

//     if (loading) return <div>Завантаження...</div>;

//     return (
//         <div className="add-drug-container">
//             <button className="back-btn" onClick={() => navigate(`/drugs/${id}`)}>← Назад</button>

//             <div className="add-drug-card">
//                 <h2>Редагування: {formData?.trade_name}</h2>
                
//                 {/* Блок планування */}
//                 <div className="calculation-box" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e9ecef' }}>
//                     <h4 style={{ margin: '0 0 10px 0' }}>Планування фармаконагляду</h4>
//                     <div className="input-group" style={{ marginBottom: '15px' }}>
//                         <label className="input-label">Відповідальний працівник</label>
//                         <select 
//                             name="assigned_to" 
//                             className="form-select" 
//                             onChange={handleChange} 
//                             value={formData.assigned_to || ''}
//                         >
//                             <option value="">-- Оберіть користувача --</option>
//                             {usersList.map(u => (
//                                 <option key={u.id} value={u.id}>{u.email}</option>
//                             ))}
//                         </select>
//                     </div>
                    
//                     <button 
//                         type="button" 
//                         onClick={handleCalculateSchedule} 
//                         className="calculate-btn" 
//                         style={{ background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
//                     >
//                         ⚙️ Розрахувати графік та створити таски
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="drug-form">
//                     <AddDrugInput 
//                         label="Торгова назва" 
//                         name='trade_name' 
//                         value={formData?.trade_name || ''} 
//                         onChange={handleChange} 
//                         required 
//                     />
//                     <AddDrugInput 
//                         label="Діюча речовина" 
//                         name='active_substance' 
//                         value={formData?.active_substance || ''} 
//                         onChange={handleChange} 
//                     />
//                     <AddDrugInput 
//                         label="Форма випуску" 
//                         name='form_of_release' 
//                         value={formData?.form_of_release || ''} 
//                         onChange={handleChange} 
//                     />
//                     <AddDrugInput 
//                         label="Виробник" 
//                         name='manufacturer' 
//                         value={formData?.manufacturer || ''} 
//                         onChange={handleChange} 
//                     />
//                     <AddDrugInput 
//                         label="Заявник" 
//                         name='applicant' 
//                         value={formData?.applicant || ''} 
//                         onChange={handleChange} 
//                     />
                    
//                     <div style={{ marginTop: '20px' }}>
//                         <button type="submit" className="submit-drug-btn">
//                             Зберегти зміни в реєстрі
//                         </button>
//                     </div>
//                 </form>

//             </div>
//         </div>
//     );
// }