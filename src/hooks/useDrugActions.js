import { supabase } from '../api/supabaseClient';
import { calculateNextDates } from '../utils/dateLogic';
import { findBestSubstanceMatch } from '../utils/substancePicker';
import { logAction } from '../utils/audit';

export function useDrugActions() {
    // Логіка створення препарату + автоматичний розрахунок PSUR
    const createDrugWithSchedule = async (formData, userId, userEmail) => {
        // 1. Створення препарату
        const { data: newDrug, error: drugError } = await supabase
            .from('drugs')
            .insert([{ ...formData, created_by: userId }])
            .select().single();

        if (drugError) throw drugError;

        // 2. Пошук речовини та розрахунок дат
        const substance = await findBestSubstanceMatch(formData.active_substance);
        if (substance) {
            const { nextDlp, nextDeadline } = calculateNextDates(substance.dlp, substance.frequency);

            // 3. Створення регламенту
            await supabase.from('active_regulations').insert([{
                drug_id: newDrug.id,
                assigned_to: formData.assigned_to,
                type_doc: 'PSUR',
                dlp_date: nextDlp,
                submission_deadline: nextDeadline,
                status: 'В роботі',
                periodicity: substance.frequency,
                created_by: userId
            }]);

            // 4. Створення тасок
            await supabase.from('tasks').insert([
                { assigned_to: formData.assigned_to, drug_id: newDrug.id, title: `PSUR ${formData.trade_name}: DLP`, due_date: nextDlp, status: 'To Do', created_by: userId },
                { assigned_to: formData.assigned_to, drug_id: newDrug.id, title: `PSUR ${formData.trade_name}: Deadline`, due_date: nextDeadline, status: 'To Do', created_by: userId }
            ]);
        }
        return newDrug;
    };

    const updateDrug = async (id, formData, userId, userEmail) => {
        const { data: oldData } = await supabase.from('drugs').select('*').eq('id', id).single();
        const { error } = await supabase.from('drugs').update(formData).eq('id', id);
        if (error) throw error;

        // Аудит логіка всередині хука
        await logAction(userId, userEmail, 'UPDATE', 'drugs', id, {
            trade_name: formData.trade_name,
            changes: { from: oldData, to: formData }
        });
    };

    const createSchedule = async (id, drugData, userId) => {
        const substance = await findBestSubstanceMatch(drugData.active_substance);
        if (!substance) throw new Error("Речовину не знайдено");

        const { nextDlp, nextDeadline } = calculateNextDates(substance.dlp, substance.frequency);

        // Регламент
        await supabase.from('active_regulations').insert([{
            drug_id: id,
            assigned_to: drugData.assigned_to,
            type_doc: 'PSUR',
            dlp_date: nextDlp,
            submission_deadline: nextDeadline,
            status: 'В роботі',
            periodicity: substance.frequency,
            created_by: userId
        }]);

        // Таски
        await supabase.from('tasks').insert([
            { title: `PSUR ${drugData.trade_name}: DLP`, due_date: nextDlp, drug_id: id, assigned_to: drugData.assigned_to, created_by: userId, status: 'To Do' },
            { title: `PSUR ${drugData.trade_name}: Deadline`, due_date: nextDeadline, drug_id: id, assigned_to: drugData.assigned_to, created_by: userId, status: 'To Do' }
        ]);
        
        return { nextDlp, nextDeadline };
    };

    return { createDrugWithSchedule, updateDrug, createSchedule };

}