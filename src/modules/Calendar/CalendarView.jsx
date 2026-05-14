import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Notifications from './Notifications';
import './CalendarView.css';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';


export default function CalendarView({ userRole, currentUserId }) {
    const { events, loading } = useCalendarEvents(userRole, currentUserId);

    const handleNotificationClick = (event) => {
        alert(`Завдання: ${event.title}\nДата: ${event.start}`);
    };

    if (loading) return <div className="loader">Оновлення календаря...</div>;

    return (
        <div className="calendar-container card-style">
            <Notifications events={events} onNotificationClick={handleNotificationClick}/>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="uk"
                firstDay={1}
                dayMaxEvents={3} 
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }}
                buttonText={{
                    today: 'Сьогодні',
                    month: 'Місяць',
                    week: 'Тиждень'
                }}
                events={events}
                height="auto"
            />
        </div>
    );
}
