// import { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { supabase } from '../../api/supabaseClient';
// import './CalendarView.css';

// export default function CalendarView() {
//     const [events, setEvents] = useState([]);

//     useEffect(() => {
//         fetchCalendarData();
//     }, []);

//     const fetchCalendarData = async () => {
//         // 1. Отримуємо дедлайни препаратів
//         const { data: drugs } = await supabase.from('drugs').select('name, submission_date, report_type');
        
//         // 2. Отримуємо таски
//         const { data: tasks } = await supabase.from('tasks').select('title, due_date, status');

//         // Форматуємо все під формат FullCalendar
//         const drugEvents = drugs?.map(d => ({
//             title: d.report_type, // Наприклад, PSUR
//             start: d.submission_date,
//             extendedProps: { type: 'drug', drugName: d.name },
//             className: `event-drug-${d.report_type.toLowerCase()}`
//         })) || [];

//         const taskEvents = tasks?.map(t => ({
//             title: t.title,
//             start: t.due_date,
//             extendedProps: { type: 'task', status: t.status },
//             className: 'event-task'
//         })) || [];

//         setEvents([...drugEvents, ...taskEvents]);
//     };

//     return (
//         <div className="calendar-container card-style">
//             <FullCalendar
//                 plugins={[dayGridPlugin, interactionPlugin]}
//                 initialView="dayGridMonth"
//                 locale="uk"
//                 firstDay={1}
//                 dayMaxEvents={true} // Якщо івентів багато, з'явиться "+ ще"
//                 headerToolbar={{
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'dayGridMonth,dayGridWeek'
//                 }}
//                 buttonText={{
//                     today: 'Сьогодні',
//                     month: 'Місяць',
//                     week: 'Тиждень'
//                 }}
//                 events={events}
//                 eventContent={renderEventContent}
//                 height="auto"
//             />
//         </div>
//     );
// }

// // Кастомний вигляд події (як на макеті: маленькі плашки)
// function renderEventContent(eventInfo) {
//     return (
//         <div className="calendar-event-inner">
//             <b>{eventInfo.event.title}</b>
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../../api/supabaseClient';
import Notifications from './Notifications';
import './CalendarView.css';

export default function CalendarView({ userRole, currentUserId }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchCalendarData();
    }, [currentUserId]);

    const fetchCalendarData = async () => {
        // 1. Отримуємо звичайні таски
        let tasksQuery = supabase.from('tasks').select('title, due_date, status, assigned_to');
        
        // Фільтрація для звичайного юзера (якщо не адмін)
        if (userRole !== 'admin' && currentUserId) {
            tasksQuery = tasksQuery.eq('assigned_to', currentUserId);
            regsQuery = regsQuery.eq('assigned_to', currentUserId);
        }

        // 2. Отримуємо наші нові Активні регламенти
        let regsQuery = supabase
            .from('active_regulations')
            .select(`
                id, 
                dlp_date, 
                submission_deadline, 
                type_doc, 
                assigned_to,
                drugs (trade_name)
            `);


        const [{ data: tasks }, { data: regs }] = await Promise.all([tasksQuery, regsQuery]);

        // Форматуємо звичайні таски
        const taskEvents = tasks?.map(t => ({
            title: t.title,
            start: t.due_date,
            backgroundColor: '#3182ce', // Синій колір
            extendedProps: { type: 'task', status: t.status },
            className: 'event-task'
        })) || [];

        // Форматуємо Регламенти (створюємо по 2 івенти на кожен регламент: DLP та Дедлайн)
        const regEvents = regs?.flatMap(r => [
            {
                title: `DLP: ${r.drugs?.trade_name}`,
                start: r.dlp_date,
                backgroundColor: '#B9A5D6', // Сірий колір для DLP
                extendedProps: { type: 'dlp' },
                className: 'event-dlp'
            },
            {
                title: `DEADLINE: ${r.drugs?.trade_name}`,
                start: r.submission_deadline,
                backgroundColor: '#e53e3e', // Червоний колір для дедлайну
                extendedProps: { type: 'deadline' },
                className: 'event-deadline'
            }
        ]) || [];

        setEvents([...taskEvents, ...regEvents]);
    };

    const handleNotificationClick = (event) => {
        // 1. Якщо у вас є useRef для календаря, можна прокрутити до дати:
        // calendarRef.current.getApi().gotoDate(event.start);
    
        // 2. Або просто вивести деталі через alert/modal
        alert(`Завдання: ${event.title}\nДата: ${event.start}`);
        
        // Якщо у вас завдання на іншій сторінці (наприклад, Канбан):
        // navigate('/tasks'); 
    };

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