import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

export function useRegulations(userRole, currentUserId) {
    const [regulations, setRegulations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRegsAndTasks = useCallback(async () => {
        try {
            let { data: regs, error: regsError } = await supabase
                .from('active_regulations')
                .select(`
                    id, drug_id, type_doc, dlp_date, submission_deadline, assigned_to,
                    drugs (trade_name),
                    assigned_profile:assigned_to (email)
                `)
                .order('submission_deadline', { ascending: true });

            if (regsError) throw regsError;

            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('title, status, drug_id')
                .not('drug_id', 'is', null);

            if (tasksError) throw tasksError;

            // Фільтрація для звичайного користувача
            if (userRole !== 'admin' && currentUserId) {
                regs = regs.filter(r => r.assigned_to === currentUserId);
            }

            // Мапінг статусів тасок на регламенти
            const combined = regs.map(reg => ({
                ...reg,
                dlpTaskStatus: tasks.find(t => t.drug_id === reg.drug_id && t.title.includes('DLP'))?.status || 'To Do',
                deadlineTaskStatus: tasks.find(t => t.drug_id === reg.drug_id && t.title.includes('Deadline'))?.status || 'To Do'
            }));

            setRegulations(combined);
        } catch (err) {
            console.error("Помилка:", err.message);
        } finally {
            setLoading(false);
        }
    }, [userRole, currentUserId]);

    useEffect(() => {
        fetchRegsAndTasks();
        const channel = supabase
            .channel('status-updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, fetchRegsAndTasks)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [fetchRegsAndTasks]);

    return { regulations, loading, refresh: fetchRegsAndTasks };
}