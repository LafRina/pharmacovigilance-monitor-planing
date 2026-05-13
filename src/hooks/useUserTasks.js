import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export function useUserTasks(userId) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchTasks = async () => {
            const { data } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', userId)
                .neq('status', 'Done')
                .order('created_at', { ascending: false });
            setTasks(data || []);
            setLoading(false);
        };
        fetchTasks();
    }, [userId]);

    const updateTaskStatus = async (taskId, newStatus, drugId) => {
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) throw error;

        if (drugId) {
            const mappedStatus = newStatus === 'Done' ? 'Завершено' : 'В роботі';
            await supabase.from('active_regulations').update({ status: mappedStatus }).eq('drug_id', drugId);
        }
        
        setTasks(prev => newStatus === 'Done' ? prev.filter(t => t.id !== taskId) : prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    return { tasks, loading, updateTaskStatus };
}