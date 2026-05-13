import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';

export function useReports(reportId = null) {
    const [reports, setReports] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });
        setReports(data || []);
        setLoading(false);
    }, []);

    const fetchReportDetails = useCallback(async (id) => {
        setLoading(true);
        const { data } = await supabase
            .from('reports')
            .select('*')
            .eq('id', id)
            .single();
        setReport(data);
        setLoading(false);
    }, []);

    const generateAndSaveReport = async (formData, userId) => {
        // 1. Отримуємо таски за фільтрами
        let query = supabase
            .from('tasks')
            .select('*, profiles:assigned_to!inner(email)')
            .eq('profiles.email', formData.user_email)
            .gte('due_date', formData.start_date)
            .lte('due_date', formData.end_date);

        if (formData.task_type === 'psur') query = query.ilike('title', '%PSUR%');
        if (formData.task_type === 'regular') query = query.not('title', 'ilike', '%PSUR%');

        const { data: foundTasks, error: taskError } = await query;
        if (taskError) throw taskError;

        // 2. Зберігаємо звіт
        const { error: saveError } = await supabase.from('reports').insert({
            report_name: `Звіт по активності: ${formData.user_email}`,
            user_email: formData.user_email,
            period_start: formData.start_date,
            period_end: formData.end_date,
            task_type: formData.task_type,
            data: foundTasks,
            created_by: userId
        });

        if (saveError) throw saveError;
    };

    useEffect(() => {
        if (reportId) fetchReportDetails(reportId);
        else fetchReports();
    }, [reportId, fetchReports, fetchReportDetails]);

    return { reports, report, loading, generateAndSaveReport, refresh: fetchReports };
}