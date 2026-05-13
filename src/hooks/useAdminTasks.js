import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export function useAdminTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAdminTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    profiles:assigned_to (email)
                `)
                .is('drug_id', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Помилка завантаження завдань:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminTasks();

        const channel = supabase
            .channel('admin-tasks-realtime')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'tasks' }, 
                () => fetchAdminTasks()
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    return { tasks, loading, refreshTasks: fetchAdminTasks };
}