import { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .order('email', { ascending: true });
                
                if (error) throw error;
                setUsers(data || []);
            } catch (err) {
                console.error("Помилка завантаження користувачів:", err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return { users, loading };
}