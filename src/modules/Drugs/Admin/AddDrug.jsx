import { supabase } from "../../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUsers } from '../../../hooks/useUsers'; // Використовуємо хук
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


// export default function AddDrug({ user }) {
//     const navigate = useNavigate();
//     const [users, setUsers] = useState([]);
//     const [formData, setFormData] = useState({
//         trade_name: '',
//         active_substance: '',
//         form_of_release: '',
//         registration_number: '',
//         registration_date: '',
//         expiration_date: '',
//         manufacturer: '',
//         applicant: '',
//         assigned_to: ''
//     });

//     useEffect(() => {
//         async function fetchUsers() {
//             const { data, error } = await supabase
//                 .from('profiles')
//                 .select('id, email')
//                 .order('email', { ascending: true });
//                 // .not('role', 'eq', 'admin'); 
//             if (!error) setUsers(data);
//         }
//         fetchUsers();
//     }, []);
    
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     async function handleSubmit(e) {
//         e.preventDefault();

//         console.log("!!! handleSubmit ВИКЛИКАНО !!!"); // Якщо це не з'явиться в консолі - проблема у формі
//         console.log("Дані форми:", formData);
        
//         if (!user) return alert('Ви не авторизовані');
//         if (!formData.assigned_to) return alert('Оберіть відповідального');
    
//         try {
//             // 1. Створення препарату
//             const { data: newDrug, error: drugError } = await supabase
//                 .from('drugs')
//                 .insert([{
//                     trade_name: formData.trade_name,
//                     active_substance: formData.active_substance,
//                     form_of_release: formData.form_of_release,
//                     registration_number: formData.registration_number,
//                     registration_date: formData.registration_date || null,
//                     expiration_date: formData.expiration_date,
//                     manufacturer: formData.manufacturer,
//                     applicant: formData.applicant,
//                     created_by: user.id
//                 }])
//                 .select()
//                 .single();
    
//             if (drugError) {
//                 throw new Error(`Помилка при створенні препарату: ${drugError.message}`);
//             }
    
//             console.log("Препарат створено, ID:", newDrug.id);
    
//             // 2. Пошук речовини
//             const substance = await findBestSubstanceMatch(formData.active_substance);
    
//             if (substance) {
//                 const { nextDlp, nextDeadline } = calculateNextDates(substance.dlp, substance.frequency);
    
//                 // 3. Регламент
//                 const { error: regError } = await supabase
//                     .from('active_regulations')
//                     .insert([{
//                         drug_id: newDrug.id,
//                         assigned_to: formData.assigned_to,
//                         type_doc: 'PSUR',
//                         dlp_date: nextDlp,
//                         submission_deadline: nextDeadline,
//                         status: 'В роботі',
//                         periodicity: substance.frequency,
//                         created_by: user.id
//                     }]);
    
//                 if (regError) console.error("Помилка регламенту:", regError.message);
    
//                 // 4. Завдання
//                 const { error: taskError } = await supabase.from('tasks').insert([
//                     {
//                         assigned_to: formData.assigned_to,
//                         drug_id: newDrug.id,
//                         title: `PSUR ${formData.trade_name}: DLP`,
//                         due_date: nextDlp,
//                         status: 'To Do',
//                         created_by: user.id
//                     },
//                     {
//                         assigned_to: formData.assigned_to,
//                         drug_id: newDrug.id,
//                         title: `PSUR ${formData.trade_name}: Deadline`,
//                         due_date: nextDeadline,
//                         status: 'To Do',
//                         created_by: user.id
//                     }
//                 ]);
    
//                 if (taskError) console.error("Помилка завдань:", taskError.message);
//             }
    
//             alert('Все успішно додано!');
//             navigate('/drugslist');
    
//         } catch (err) {
//             alert(err.message);
//             console.error(err);
//         }
//     }

//     return (
//         <div className="add-drug-container">
//             <button className="back-btn" onClick={() => navigate('/drugslist')}>← Назад</button>

//             <div className="add-drug-card">
//                 <h2>Додати новий препарат</h2>
//                 <form onSubmit={handleSubmit} className="drug-form">
                    
//                     <div className="calculation-box" style={{ background: '#f0f7ff', padding: '15px', borderRadius: '8px', border: '1px solid #cce3ff', marginBottom: '20px' }}>
//                         <label className="input-label">Відповідальний за фармаконагляд</label>
//                         <select 
//                             name="assigned_to" 
//                             className="form-select" 
//                             onChange={handleChange}
//                             value={formData.assigned_to}
//                             required
//                         >
//                             <option value="">-- Оберіть працівника --</option>
//                             {users.map(u => (
//                                 <option key={u.id} value={u.id}>{u.email}</option>
//                             ))}
//                         </select>
//                         <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
//                             * Графік PSUR буде розраховано автоматично після натискання кнопки збереження.
//                         </p>
//                     </div>

//                     <AddDrugInput label="Торгова назва" name='trade_name' value={formData.trade_name} onChange={handleChange} required />
//                     <AddDrugInput label="Діюча речовина" name='active_substance' value={formData.active_substance} onChange={handleChange} required />
//                     <AddDrugInput label="Форма випуску" name='form_of_release' value={formData.form_of_release} onChange={handleChange} />
//                     <AddDrugInput label="Номер реєстрації" name='registration_number' value={formData.registration_number} onChange={handleChange} required />
//                     <AddDrugInput label="Дата реєстрації" name='registration_date' type="date" value={formData.registration_date} onChange={handleChange} />
//                     <AddDrugInput label="Термін дії" name='expiration_date' value={formData.expiration_date} onChange={handleChange} required />
//                     <AddDrugInput label="Виробник" name='manufacturer' value={formData.manufacturer} onChange={handleChange} />
//                     <AddDrugInput label="Заявник" name='applicant' value={formData.applicant} onChange={handleChange} />
                    
//                     <button type="submit" className="submit-drug-btn" style={{ marginTop: '20px' }}>
//                         Зберегти препарат та створити графік
//                     </button>                
//                 </form>
//             </div>
//         </div>
//     );
// }