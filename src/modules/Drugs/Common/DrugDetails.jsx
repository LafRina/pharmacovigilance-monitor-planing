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


