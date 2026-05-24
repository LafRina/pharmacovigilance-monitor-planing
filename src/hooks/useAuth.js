import { supabase } from '../api/supabaseClient';

export function useAuth() {
    // Логіка реєстрації
    const register = async (email, password) => {
        // Створення акаунта в Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
            // Створення профілю в базі
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: data.user.id, email, role: 'user' }]);
            if (profileError) throw profileError;
        }
        return data.user;
    };

    // Логіка входу
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Отримуємо роль
        const { data: profile, error: roleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
        
        if (roleError) throw roleError;
        return { user: data.user, role: profile.role };
    };

    return { register, login };
}