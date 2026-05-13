import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

export function useStats(user, userRole) {
    const [stats, setStats] = useState({ totalActive: 0, upcomingDeadlines: 0, inProgress: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const twoWeeksStr = new Date(Date.now() + 12096e5).toISOString().split('T')[0];

        let totalQuery = supabase.from('active_regulations').select('*', { count: 'exact', head: true });
        let upcomingQuery = supabase.from('tasks').select('*', { count: 'exact', head: true });
        let inProgressQuery = supabase.from('tasks').select('*', { count: 'exact', head: true });

        if (userRole !== 'admin') {
            const filter = { column: 'assigned_to', value: user.id };
            totalQuery = totalQuery.eq(filter.column, filter.value);
            upcomingQuery = upcomingQuery.eq(filter.column, filter.value);
            inProgressQuery = inProgressQuery.eq(filter.column, filter.value);
        }

        const [total, upcoming, progress] = await Promise.all([
            totalQuery,
            upcomingQuery.gte('due_date', todayStr).lte('due_date', twoWeeksStr),
            inProgressQuery.eq('status', 'In Progress')
        ]);

        setStats({
            totalActive: total.count || 0,
            upcomingDeadlines: upcoming.count || 0,
            inProgress: progress.count || 0
        });
        setLoading(false);
    }, [user, userRole]);

    useEffect(() => {
        fetchStats();
        const channel = supabase.channel('stats-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_regulations' }, fetchStats)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [fetchStats]);

    return { stats, loading };
}