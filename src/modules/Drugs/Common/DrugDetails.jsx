// import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { supabase } from '../../../api/supabaseClient';
// import { logAction } from '../../../utils/audit';
import './DrugDetails.css';
import { useDrugs } from '../../../hooks/useDrugs';


export default function DrugDetails({ user, userRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { drug, loading, deleteDrug } = useDrugs(id);

    const handleDelete = async () => {
        const confirmed = window.confirm(`Ви впевнені, що хочете видалити "${drug.trade_name}"?`);
        if (!confirmed) return;

        try {
            await deleteDrug(id, drug.trade_name, user);
            alert('Препарат видалено');
            navigate('/drugslist'); 
        } catch (err) {
            alert('Помилка при видаленні: ' + err.message);
        }
    };

    if (loading) return <div className="loading-container">Завантаження...</div>;
    if (!drug) return <div className="error-container">Препарат не знайдено.</div>;

    return (
        <div className="drug-details-page">
            <button className="back-link" onClick={() => navigate('/drugslist')}>← Назад до реєстру</button>
            <div className="details-card">
                <div className="details-header">
                    <h1>{drug.trade_name}</h1>
                    <div className="action-buttons">
                        {userRole === 'admin' && (
                            <>
                                <button className="btn-edit" onClick={() => navigate(`/edit-drug/${drug.id}`)}>✎ Редагувати</button>
                                <button className="btn-delete" onClick={handleDelete}>🗑 Видалити</button>
                            </>
                        )}
                    </div>
                </div>
                <section className="main-info">
                    <div className="info-row">
                        <span className="label">Діюча речовина:</span>
                        <span className="value">{drug.active_substance || 'Не вказано'}</span>
                    </div>
                    
                    <div className="info-row">
                        <span className="label">Номер реєстраційного посвідчення:</span>
                        <span className="value">{drug.registration_number || 'Не вказано'}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">Дата реєстрації:</span>
                        <span className="value">{drug.registration_date || 'Не вказано'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Дата закінчення реєстрації:</span>
                        <span className="value">{drug.expiration_date || 'Безстроково'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Форма випуску:</span>
                        <span className="value">{drug.form_of_release || 'Не вказано'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Виробник:</span>
                        <span className="value">{drug.manufacturer || 'Не вказано'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Заявник:</span>
                        <span className="value">{drug.applicant || 'Не вказано'}</span>
                    </div>
                </section>
            </div>
        </div>
    );
}


// export default function DrugDetails({user, userRole}) {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [drug, setDrug] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchDrugDetails();
//     }, [id]);

//     async function fetchDrugDetails() {
//         setLoading(true);
//         const { data, error } = await supabase
//             .from('drugs')
//             .select('*')
//             .eq('id', id)
//             .single();

//         if (error) {
//             console.error('Помилка завантаження деталей:', error);
//         } else {
//             setDrug(data);
//         }
//         setLoading(false);
//     }

//     const handleDelete = async () => {
//         // Змінюємо formData на drug, бо саме так називається ваш стейт
//         const confirmed = window.confirm(
//             `Ви впевнені, що хочете видалити препарат "${drug.trade_name}"? \nЦе також видалить усі пов'язані завдання та регламенти!`
//         );
    
//         if (!confirmed) return;
    
//         try {
//             const { error } = await supabase
//                 .from('drugs')
//                 .delete()
//                 .eq('id', id);
    
//             if (error) throw error;
    
//             // Записуємо видалення в аудит (переконайтеся, що об'єкт user передано в компонент)
//             if (user) {
//                 await logAction(
//                     user.id,
//                     user.email,
//                     'DELETE',
//                     'drugs',
//                     id,
//                     { trade_name: drug.trade_name, status: 'removed_permanently' }
//                 );
//             }
    
//             alert('Препарат та всі пов’язані дані видалено');
//             navigate('/drugslist'); 
//         } catch (err) {
//             console.error("Помилка видалення:", err);
//             alert('Помилка при видаленні: ' + err.message);
//         }
//     };

//     if (loading) return <div className="loading-container">Завантаження інформації...</div>;
//     if (!drug) return <div className="error-container">Препарат не знайдено.</div>;

//     return (
//         <div className="drug-details-page">
//             <button className="back-link" onClick={() => navigate('/drugslist')}>
//                 ← Детальна інформація про препарат
//             </button>

//             <div className="details-card">
//                 <div className="details-header">
//                     <h1>{drug.trade_name}</h1>
//                     <div className="action-buttons">
//                         {userRole === 'admin' && (
//                             <button 
//                                 className="btn-edit" 
//                                 onClick={() => navigate(`/edit-drug/${drug.id}`)}
//                             >
//                                 ✎ Редагувати
//                             </button>
//                         )}
//                         {userRole === 'admin' && (
//                             <button 
//                                 className="btn-delete" 
//                                 onClick={handleDelete}
//                             >
//                                 🗑 Видалити
//                             </button>
//                         )}
//                     </div>
//                 </div>
                
//                 <section className="main-info">
//                     <div className="info-row">
//                         <span className="label">Діюча речовина:</span>
//                         <span className="value">{drug.active_substance || 'Не вказано'}</span>
//                     </div>
                    
//                     <div className="info-row">
//                         <span className="label">Номер реєстраційного посвідчення:</span>
//                         <span className="value">{drug.registration_number || 'Не вказано'}</span>
//                     </div>

//                     <div className="info-row">
//                         <span className="label">Дата реєстрації:</span>
//                         <span className="value">{drug.registration_date || 'Не вказано'}</span>
//                     </div>
//                     <div className="info-row">
//                         <span className="label">Дата закінчення реєстрації:</span>
//                         <span className="value">{drug.expiration_date || 'Безстроково'}</span>
//                     </div>
//                     <div className="info-row">
//                         <span className="label">Форма випуску:</span>
//                         <span className="value">{drug.form_of_release || 'Не вказано'}</span>
//                     </div>
//                     <div className="info-row">
//                         <span className="label">Виробник:</span>
//                         <span className="value">{drug.manufacturer || 'Не вказано'}</span>
//                     </div>
//                     <div className="info-row">
//                         <span className="label">Заявник:</span>
//                         <span className="value">{drug.applicant || 'Не вказано'}</span>
//                     </div>
//                 </section>


//             </div>
//         </div>
//     );
// }