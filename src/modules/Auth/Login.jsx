import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';
import Input from './Input';
import Logo from './Logo';

export default function Login({ userRole }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Додаємо функцію обробки вводу
    function handleInputChange(identifier, value) {
        if (identifier === 'email') {
            setEmail(value);
        } else if (identifier === 'password') {
            setPassword(value);
        }
    }

    // Автоматичне перенаправлення за роллю 
    useEffect(() => {
        if (userRole === 'admin') navigate('/admindashboard');
        else if (userRole === 'user') navigate('/userdashboard');
    }, [userRole, navigate]);

    // Валідація для пропсів Input
    const emailNotValid = submitted && !email.includes('@');
    const passwordNotValid = submitted && password.trim().length < 6;

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        
        // Перевірка перед запитом
        if (emailNotValid || passwordNotValid) return;

        try {
            const { role } = await login(email, password);
            navigate(role === 'admin' ? '/admindashboard' : '/userdashboard');
        } catch (error) {
            alert('Помилка входу: ' + error.message);
        }
    };

    return (
        <div className="auth-container">
            <Logo />
            <div className="auth-card">
                <h2>Вхід</h2>
                <form className='input-group' onSubmit={handleLogin} noValidate>
                    <Input 
                        placeholder="Введіть email"
                        type="email"
                        invalid={emailNotValid}
                        value={email}
                        onChange={(event) => handleInputChange('email', event.target.value)}
                    />
                    <Input 
                        placeholder="Введіть пароль"
                        type="password" 
                        invalid={passwordNotValid}
                        value={password}
                        onChange={(event) => handleInputChange('password', event.target.value)}
                    />
                    <button type="submit" className="btn-enter">ВХІД</button>
                </form>
                
                <p>або</p>

                <p className="auth-footer-text">
                    <Link to="/register" className="auth-link">Зареєструватися</Link>, 
                    якщо ще не маєте облікового запису
                </p>
            </div>
        </div>
    );
}
