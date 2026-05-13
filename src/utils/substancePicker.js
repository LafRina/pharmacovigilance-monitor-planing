import { supabase } from '../api/supabaseClient';

export const findBestSubstanceMatch = async (substanceName) => {
    try {
        // Спроба 1: Шукаємо точне співпадіння (моно-препарат)
        // Використовуємо .maybeSingle() замість .single()
        // .maybeSingle() повертає null, якщо нічого не знайдено, замість помилки
        const { data: exact, error } = await supabase
            .from('active_substances')
            .select('*')
            .eq('active_substance', substanceName)
            .maybeSingle();

        if (exact) return exact;

        // Спроба 2: Шукаємо в комбінаціях (через ilike)
        const { data: combo } = await supabase
            .from('active_substances')
            .select('*')
            .ilike('active_substance', `%${substanceName}%`)
            .limit(1);

        return (combo && combo.length > 0) ? combo[0] : null;
        
    } catch (err) {
        console.error("Помилка у findBestSubstanceMatch:", err);
        return null;
    }
};