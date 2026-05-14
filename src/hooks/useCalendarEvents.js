import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

export function useCalendarEvents(userRole, currentUserId) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCalendarData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Формуємо запити
            let tasksQuery = supabase.from('tasks').select('title, due_date, status, assigned_to');
            let regsQuery = supabase.from('active_regulations').select(`
                id, dlp_date, submission_deadline, drugs (trade_name), assigned_to
            `);

            // Фільтрація для користувача
            if (userRole !== 'admin' && currentUserId) {
                tasksQuery = tasksQuery.eq('assigned_to', currentUserId);
                regsQuery = regsQuery.eq('assigned_to', currentUserId);
            }

            const [{ data: tasks }, { data: regs }] = await Promise.all([tasksQuery, regsQuery]);

            // 2. Форматуємо таски
            const taskEvents = tasks?.map(t => ({
                title: t.title,
                start: t.due_date,
                backgroundColor: '#3182ce',
                extendedProps: { type: 'task', status: t.status }
            })) || [];

            // 3. Форматуємо регламенти (DLP + Deadline)
            const regEvents = regs?.flatMap(r => [
                {
                    title: `DLP: ${r.drugs?.trade_name}`,
                    start: r.dlp_date,
                    backgroundColor: '#B9A5D6',
                    extendedProps: { type: 'dlp' }
                },
                {
                    title: `DEADLINE: ${r.drugs?.trade_name}`,
                    start: r.submission_deadline,
                    backgroundColor: '#e53e3e',
                    extendedProps: { type: 'deadline' }
                }
            ]) || [];

            setEvents([...taskEvents, ...regEvents]);
        } catch (err) {
            console.error("Помилка календаря:", err.message);
        } finally {
            setLoading(false);
        }
    }, [userRole, currentUserId]);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    return { events, loading, refresh: fetchCalendarData };
}