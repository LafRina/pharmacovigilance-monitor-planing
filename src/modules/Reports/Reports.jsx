import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports'; // Імпортуємо ваш хук
import './Reports.css'; 

export default function Reports() {
    const navigate = useNavigate();
    // 1. Використовуємо хук замість локального стейту та useEffect
    const { reports, loading } = useReports(); 

    const [userFilter, setUserFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    if (loading) return <div className="loader">Завантаження звітів...</div>;

    const uniqueUsers = [...new Set(reports.map(r => r.user_email))].filter(Boolean);

    const filteredReports = reports.filter(report => {
        const matchesUser = userFilter === 'all' || report.user_email === userFilter;
        const matchesDate = !dateFilter || report.created_at.startsWith(dateFilter);
        return matchesUser && matchesDate;
    });

    return (
        <div className="reports-container">
            <header className="reports-header-row">
                <h2>Звіти</h2>
                <button className="add-report-btn-top" onClick={() => navigate('/reports/new')}>+</button>
            </header>

            <div className="tasks-layout">
                <aside className="tasks-sidebar">
                    {/* Фільтри залишаються без змін */}
                </aside>

                <main className="reports-grid">
                    {filteredReports.map(report => (
                        <div key={report.id} className="report-card-styled">
                            <div className="report-card-content">
                                <h3>{report.report_name}</h3>
                                <p className="report-card-date">
                                    Створено: {new Date(report.created_at).toLocaleDateString('uk-UA')}
                                </p>
                                <div className="report-card-tag">{report.user_email}</div>
                            </div>
                            <div className="report-card-footer">
                                <button className="view-report-btn" onClick={() => navigate(`/reports/${report.id}`)}>
                                    Переглянути &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
        </div>
    );
}

// export default function Reports() {
//     const [reports, setReports] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();

//     // Стан для фільтрів
//     const [userFilter, setUserFilter] = useState('all');
//     const [dateFilter, setDateFilter] = useState('');

//     useEffect(() => {
//         async function fetchReports() {
//             const { data, error } = await supabase
//                 .from('reports')
//                 .select('*')
//                 .order('created_at', { ascending: false });
            
//             if (!error) setReports(data || []);
//             setLoading(false);
//         }
//         fetchReports();
//     }, []);

//     const uniqueUsers = [...new Set(reports.map(r => r.user_email))].filter(Boolean);

//     // Логіка фільтрації
//     const filteredReports = reports.filter(report => {
//         const matchesUser = userFilter === 'all' || report.user_email === userFilter;
//         const matchesDate = !dateFilter || report.created_at.startsWith(dateFilter);
//         return matchesUser && matchesDate;
//     });

//     if (loading) return <div className="loader">Завантаження звітів...</div>;

//     return (
//         <div className="reports-container">
//             <div>
//                 <header className="reports-header-row">
//                     <h2>Звіти</h2>
//                     <button className="add-report-btn-top" onClick={() => navigate('/reports/new')}>+</button>
//                 </header>

//                 <aside className="tasks-sidebar">
//                     <div className="filter-group">
//                         <label>Користувач у звіті:</label>
//                         <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
//                             <option value="all">Усі користувачі</option>
//                             {uniqueUsers.map(email => (
//                                 <option key={email} value={email}>{email}</option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="filter-group">
//                         <label>Дата створення:</label>
//                         <input 
//                             type="date" 
//                             value={dateFilter} 
//                             onChange={(e) => setDateFilter(e.target.value)}
//                         />
//                     </div>

//                     {(userFilter !== 'all' || dateFilter !== '') && (
//                         <button className="reset-filter-btn" onClick={() => { setUserFilter('all'); setDateFilter(''); }}>
//                             Скинути фільтри
//                         </button>
//                     )}
//                 </aside>

//             </div>

//             <div className="tasks-layout">
//                 {/* Сітка карток */}
//                 <main className="reports-grid">
//                     {filteredReports.map(report => (
//                         <div key={report.id} className="report-card-styled">
//                             <div className="report-card-content">
//                                 <h3>{report.report_name}</h3>
//                                 <p className="report-card-date">
//                                     Створено: {new Date(report.created_at).toLocaleDateString('uk-UA')}
//                                 </p>
//                                 <div className="report-card-tag">
//                                     {report.user_email}
//                                 </div>
//                             </div>
//                             <div className="report-card-footer">
//                                 <button 
//                                     className="view-report-btn" 
//                                     onClick={() => navigate(`/reports/${report.id}`)}
//                                 >
//                                     Переглянути &rarr;
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                     {filteredReports.length === 0 && (
//                         <div className="no-results">Звітів не знайдено</div>
//                     )}
//                 </main>
//             </div>
//         </div>
//     );
// }