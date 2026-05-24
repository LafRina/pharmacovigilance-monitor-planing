import { supabase } from '../api/supabaseClient';
import { calculateNextDates } from '../utils/dateLogic';
import { findBestSubstanceMatch } from '../utils/substancePicker';
import { logAction } from '../utils/audit';

export function useDrugActions() {
    
    const createDrugWithSchedule = async (formData, userId, userEmail) => {
        console.log("🚀 Початок процесу створення препарату...");

        try {
            // 1. Деструктуризація: відокремлюємо assigned_to, бо його немає в таблиці drugs
            const { assigned_to, ...drugTableData } = formData;

            // 2. Форматування дат (конвертуємо з DD.MM.YYYY у YYYY-MM-DD для PostgreSQL)
            const formatDate = (dateStr) => {
                if (!dateStr || !dateStr.includes('.')) return dateStr;
                return dateStr.split('.').reverse().join('-');
            };

            const payload = {
                trade_name: drugTableData.trade_name,
                active_substance: drugTableData.active_substance,
                form_of_release: drugTableData.form_of_release,
                registration_number: drugTableData.registration_number,
                registration_date: formatDate(drugTableData.registration_date),
                expiration_date: formatDate(drugTableData.expiration_date),
                manufacturer: drugTableData.manufacturer,
                applicant: drugTableData.applicant,
                created_by: userId
            };

            console.log("📡 Відправка даних у таблицю 'drugs':", payload);

            // 3. Вставка в таблицю drugs
            const { data: newDrug, error: drugError } = await supabase
                .from('drugs')
                .insert([payload])
                .select()
                .single();

            if (drugError) throw drugError;
            console.log("✅ Препарат створено успішно:", newDrug);

            // 4. Пошук відповідності діючої речовини для розрахунку регламенту
            const substance = await findBestSubstanceMatch(drugTableData.active_substance);
            
            if (substance) {
                console.log("🔍 Знайдено речовину для регламенту:", substance);
                const { nextDlp, nextDeadline } = calculateNextDates(substance.dlp, substance.frequency);

                // 5. Створення запису в active_regulations
                const { error: regError } = await supabase.from('active_regulations').insert([{
                    drug_id: newDrug.id,
                    assigned_to: assigned_to,
                    type_doc: 'PSUR',
                    dlp_date: nextDlp,
                    submission_deadline: nextDeadline,
                    status: 'В роботі',
                    periodicity: substance.frequency,
                    created_by: userId
                }]);

                if (regError) throw regError;

                // 6. Створення тасок для календаря
                const { error: taskError } = await supabase.from('tasks').insert([
                    { 
                        assigned_to, 
                        drug_id: newDrug.id, 
                        title: `PSUR ${drugTableData.trade_name}: DLP`, 
                        due_date: nextDlp, 
                        status: 'To Do', 
                        created_by: userId 
                    },
                    { 
                        assigned_to, 
                        drug_id: newDrug.id, 
                        title: `PSUR ${drugTableData.trade_name}: Deadline`, 
                        due_date: nextDeadline, 
                        status: 'To Do', 
                        created_by: userId 
                    }
                ]);

                if (taskError) throw taskError;
                console.log("📅 Графік та завдання успішно сформовані");
            }

            // 7. Логування дії в Audit Trail
            await logAction(userId, userEmail, 'CREATE', 'drugs', newDrug.id, payload);

            return newDrug;

        } catch (error) {
            console.error("💥 Помилка в useDrugActions:", error.message);
            throw error;
        }
    };

    const updateDrug = async (id, formData, userId, userEmail) => {
        // Логіка оновлення залишається подібною, з деструктуризацією assigned_to
        const { assigned_to, ...updateData } = formData;
        
        const { data: oldData } = await supabase.from('drugs').select('*').eq('id', id).single();
        const { error } = await supabase.from('drugs').update(updateData).eq('id', id);
        
        if (error) throw error;

        await logAction(userId, userEmail, 'UPDATE', 'drugs', id, {
            changes: { from: oldData, to: updateData }
        });
    };

    return { createDrugWithSchedule, updateDrug };
}