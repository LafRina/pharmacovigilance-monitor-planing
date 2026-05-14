import { useEffect, useState } from 'react';
import './CalendarView.css';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';


export default function Notifications({ events, onNotificationClick }) {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (events && events.length > 0) {
            const today = startOfDay(new Date());

            const upcomingAlerts = events.reduce((acc, event) => {
                // Фільтруємо виконані
                const status = event.extendedProps?.status?.toLowerCase();
                if (status === 'completed' || status === 'done') return acc;

                // Рахуємо різницю в днях напряму
                const eventDate = startOfDay(parseISO(event.start));
                const daysDiff = differenceInDays(eventDate, today);

                // Умова: сьогодні (0), завтра (1) або через тиждень (7)
                // Додаємо 0, щоб ти бачила сповіщення про "Додати новий препарат" прямо зараз
                if (daysDiff === 0 || daysDiff === 1 || daysDiff === 7) {
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

    const handleClose = (e, id) => {
        e.stopPropagation();
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="notifications-overlay">
            {alerts.map((alert) => (
                <div 
                    key={alert.id} 
                    className={`notification-item ${alert.daysLeft <= 1 ? 'urgent' : 'warning'}`}
                    onClick={() => onNotificationClick(alert.rawEvent)}
                >
                    <span className="bell-icon">🔔</span>
                    <div className="notification-text">
                        <strong>
                            {alert.daysLeft === 0 && 'СЬОГОДНІ: '}
                            {alert.daysLeft === 1 && 'ТЕРМІНОВО (завтра): '}
                            {alert.daysLeft === 7 && 'НАГАДУВАННЯ (через тиждень): '}
                        </strong>
                        {alert.title}
                        <div className="click-hint">Натисніть, щоб переглянути</div>
                    </div>
                    <button className="close-notification-btn" onClick={(e) => handleClose(e, alert.id)}>&times;</button>
                </div>
            ))}
        </div>
    );
}
