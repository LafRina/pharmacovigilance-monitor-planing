import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Auth.css';
import Input from './Input';
import Logo from './Logo';
import { supabase } from '../../api/supabaseClient';


export default function Register() {
    const [enteredEmail, setEnteredEmail] = useState('');
    const [enteredPassword, setEnteredPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function handleInputChange(identifier, value) {
        if (identifier === 'email') {
            setEnteredEmail(value);
        } else if (identifier === 'password') {
            setEnteredPassword(value);
        } else if (identifier === 'confirm') {
            setConfirmPassword(value);
        }
    }

    const navigate = useNavigate();
    
    async function handleRegister(e) {
        e.preventDefault();
        setSubmitted(true);

        const isEmailValid = enteredEmail.includes('@');
        const isPasswordValid = enteredPassword.trim().length >= 6;
        const arePasswordsMatch = enteredPassword === confirmPassword;

        if (!isEmailValid || !isPasswordValid || !arePasswordsMatch) {
            console.log('Валідація не пройдена');
            return;
        }

        console.log('Дані готові до відправки в Supabase:', { enteredEmail, enteredPassword });
        
        // 1. Реєстрація користувача
        const { data, error } = await supabase.auth.signUp({
            email: enteredEmail,
            password: enteredPassword,
        });

        if (error) {
            alert('Помилка реєстрації: ' + error.message);
        } else if (data.user) {
            // 2. Створення профілю в таблиці profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{ id: data.user.id, email: enteredEmail, role: 'user' }]);

            if (profileError) {
                console.error('Помилка профілю:', profileError.message);
            } else {
                alert('Реєстрація успішна!');
                navigate('/login');
            }
        }

    }

    const emailNotValid = submitted && !enteredEmail.includes('@');
    const passwordNotValid = submitted && enteredPassword.trim().length < 6;
    const passwordsDontMatch = submitted && (enteredPassword !== confirmPassword);

    return (
        <div className="auth-container">
            <Logo />
            <div className="auth-card">
                <h2>Реєстрація</h2>
                <form className='input-group' onSubmit={handleRegister} noValidate>
                    <Input 
                        placeholder="Введіть email"
                        type="email"
                        invalid={emailNotValid}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                        value={enteredEmail}
                    />
                    <Input 
                        placeholder="Введіть пароль"
                        type="password"
                        invalid={passwordNotValid}
                        onChange={(event) => handleInputChange('password', event.target.value)}
                        value={enteredPassword}
                    />
                    <Input 
                        placeholder="Повторіть пароль"
                        type="password"
                        invalid={passwordsDontMatch}
                        onChange={(event) => handleInputChange('confirm', event.target.value)}
                        value={confirmPassword}
                    />
                    <button type="submit" className="btn-register">ЗАРЕЄСТРУВАТИСЯ</button>
                </form>
                
                <p>або</p>

                <p className="auth-footer-text">
                    <Link to="/login" className="auth-link">Увійти</Link>, 
                    якщо вже маєте обліковий запис
                </p>
            </div>
        </div>
    );
}