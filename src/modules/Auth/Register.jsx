import Input from './Input';
import Logo from './Logo';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    // Використовуємо один об'єкт для всіх полів
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        confirm: '' 
    });
    const [submitted, setSubmitted] = useState(false);

    // Універсальний обробник змін
    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const isEmailValid = formData.email.includes('@');
        const isPasswordValid = formData.password.length >= 6;
        const arePasswordsMatch = formData.password === formData.confirm;

        if (isEmailValid && isPasswordValid && arePasswordsMatch) {
            try {
                await register(formData.email, formData.password);
                alert('Реєстрація успішна!');
                navigate('/login');
            } catch (error) {
                alert('Помилка: ' + error.message);
            }
        }
    };

    // Логіка валідації для пропсів Input
    const emailNotValid = submitted && !formData.email.includes('@');
    const passwordNotValid = submitted && formData.password.length < 6;
    const passwordsDontMatch = submitted && (formData.password !== formData.confirm);

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
                        onChange={(e) => handleChange('email', e.target.value)}
                        value={formData.email}
                    />
                    <Input 
                        placeholder="Введіть пароль"
                        type="password"
                        invalid={passwordNotValid}
                        onChange={(e) => handleChange('password', e.target.value)}
                        value={formData.password}
                    />
                    <Input 
                        placeholder="Повторіть пароль"
                        type="password"
                        invalid={passwordsDontMatch}
                        onChange={(e) => handleChange('confirm', e.target.value)}
                        value={formData.confirm}
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
