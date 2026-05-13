import { useEffect, useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import './CalendarView.css';

export default function Notifications({ events, onNotificationClick }) {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (events.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const upcomingAlerts = events.reduce((acc, event) => {
                const eventDate = parseISO(event.start);
                const daysDiff = differenceInDays(eventDate, today);

                // Нагадування за 7 днів або 1 день
                if (daysDiff === 7 || daysDiff === 1) {
                    acc.push({
                        id: event.id || Math.random(),
                        title: event.title,
                        daysLeft: daysDiff,
                        rawEvent: event
                    });
                }
                return acc;
            }, []);

            setAlerts(upcomingAlerts);
        }
    }, [events]);

    // Функція для закриття одного сповіщення
    const handleClose = (e, id) => {
        e.stopPropagation(); // Щоб клік по "х" не викликав перехід за посиланням
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="notifications-overlay">
            {alerts.map((alert) => (
                <div 
                    key={alert.id} 
                    className={`notification-item ${alert.daysLeft === 1 ? 'urgent' : 'warning'}`}
                    onClick={() => onNotificationClick(alert.rawEvent)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <span className="bell-icon">🔔</span>
                    <div className="notification-text">
                        <strong>{alert.daysLeft === 1 ? 'ТЕРМІНОВО: ' : 'Нагадування: '}</strong>
                        {alert.title}
                        <div className="click-hint">Натисніть, щоб переглянути</div>
                    </div>

                    {/* Кнопка закриття */}
                    <button 
                        className="close-notification-btn"
                        onClick={(e) => handleClose(e, alert.id)}
                        title="Закрити"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
}