import { supabase } from '../api/supabaseClient';

export async function logAction(userId, userEmail, action, tableName, recordId, details) {
    const { error } = await supabase
        .from('audit_logs')
        .insert([{
            user_id: userId,
            user_email: userEmail,
            action: action,
            table_name: tableName,
            record_id: recordId,
            details: details
        }]);
    
    if (error) console.error('Audit Log Error:', error);
}