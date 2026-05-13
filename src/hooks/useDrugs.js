import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { logAction } from '../utils/audit';

export function useDrugs(drugId = null) {
    const [drugs, setDrugs] = useState([]);
    const [drug, setDrug] = useState(null);
    const [loading, setLoading] = useState(true);

    // Отримання всього списку
    const fetchDrugs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .order('trade_name', { ascending: true });
        
        if (!error) setDrugs(data || []);
        setLoading(false);
    }, []);

    // Отримання одного препарату за ID
    const fetchDrugDetails = useCallback(async (id) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('drugs')
            .select('*')
            .eq('id', id)
            .single();
        
        if (!error) setDrug(data);
        setLoading(false);
    }, []);

    // Видалення препарату
    const deleteDrug = async (id, tradeName, user) => {
        const { error } = await supabase.from('drugs').delete().eq('id', id);
        if (error) throw error;

        if (user) {
            await logAction(user.id, user.email, 'DELETE', 'drugs', id, { 
                trade_name: tradeName, 
                status: 'removed_permanently' 
            });
        }
    };

    useEffect(() => {
        if (drugId) {
            fetchDrugDetails(drugId);
        } else {
            fetchDrugs();
        }
    }, [drugId, fetchDrugs, fetchDrugDetails]);

    return { drugs, drug, loading, deleteDrug, refresh: fetchDrugs };
}