// import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../api/supabaseClient';
import StatsCard from './StatsCard';
import './GeneralInfoBlock.css';
import { useStats } from '../../../hooks/useStats'; // Імпорт хука


export default function GeneralInfoBlock({ user, userRole }) {
    const { stats, loading } = useStats(user, userRole);

    if (loading) return null; 

    return (
        <div className="stats-section">
            <h2 className="stats-title">Загальна інформація</h2>
            <div className="stats-grid">
                <StatsCard 
                    value={stats.totalActive} 
                    icon="✔️" 
                    label="Всього активних регламентів" 
                />
                <StatsCard 
                    value={stats.upcomingDeadlines} 
                    icon="⏰" 
                    label="Найближчі дедлайни" 
                />
                <StatsCard 
                    value={stats.inProgress} 
                    icon="ℹ️" 
                    label="У роботі" 
                />
            </div>
        </div>
    );
}


// export default function GeneralInfoBlock({ user, userRole }) {
//     const [stats, setStats] = useState({
//         totalActive: 0,
//         upcomingDeadlines: 0,
//         inProgress: 0
//     });
//     // Додаємо стан завантаження
//     const [loading, setLoading] = useState(true);

//     const fetchStats = useCallback(async () => {
//         if (!user) return;
        
//         // Починаємо завантаження при кожному виклику (якщо потрібно)
//         // setLoading(true); 

//         const todayStr = new Date().toISOString().split('T')[0];
//         const twoWeeksStr = new Date(Date.now() + 12096e5).toISOString().split('T')[0];

//         let totalQuery = supabase.from('active_regulations').select('*', { count: 'exact', head: true });
//         let upcomingQuery = supabase.from('tasks').select('*', { count: 'exact', head: true });
//         let inProgressQuery = supabase.from('tasks').select('*', { count: 'exact', head: true });

//         if (userRole !== 'admin') {
//             totalQuery = totalQuery.eq('assigned_to', user.id);
//             upcomingQuery = upcomingQuery.eq('assigned_to', user.id);
//             inProgressQuery = inProgressQuery.eq('assigned_to', user.id);
//         }

//         try {
//             const [total, upcoming, progress] = await Promise.all([
//                 totalQuery,
//                 upcomingQuery.gte('due_date', todayStr).lte('due_date', twoWeeksStr),
//                 inProgressQuery.eq('status', 'In Progress')
//             ]);

//             setStats({
//                 totalActive: total.count || 0,
//                 upcomingDeadlines: upcoming.count || 0,
//                 inProgress: progress.count || 0
//             });
//         } catch (error) {
//             console.error("Помилка:", error);
//         } finally {
//             // Вимикаємо завантаження після завершення запиту
//             setLoading(false);
//         }
//     }, [user, userRole]);

//     useEffect(() => {
//         fetchStats();

//         // Підписка на оновлення в реальному часі
//         const channel = supabase
//             .channel('global-stats-changes')
//             .on(
//                 'postgres_changes', 
//                 { event: '*', schema: 'public', table: 'tasks' }, 
//                 () => fetchStats()
//             )
//             .on(
//                 'postgres_changes', 
//                 { event: '*', schema: 'public', table: 'active_regulations' }, 
//                 () => fetchStats()
//             )
//             .subscribe();

//         return () => {
//             supabase.removeChannel(channel);
//         };
//     }, [fetchStats]); // Тепер useEffect залежить від стабільної функції fetchStats

//     return (
//         <div className="stats-section">
//             <h2 className="stats-title">Загальна інформація</h2>
//             <div className="stats-grid">
//                 <StatsCard value={stats.totalActive} icon="✔️" label="Всього активних регламентів" />
//                 <StatsCard value={stats.upcomingDeadlines} icon="⏰" label="Найближчі дедлайни" />
//                 <StatsCard value={stats.inProgress} icon="ℹ️" label="У роботі" />
//             </div>
//         </div>
//     );
// }