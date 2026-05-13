// Тут опиcана логіка "70/90 днів" та перевірку на вихідні.

import { addDays, isWeekend, subDays, addYears, addMonths, parseISO, format, differenceInDays } from 'date-fns';

export const getDaysLeft = (targetDate) => {
    const days = differenceInDays(parseISO(targetDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)} дн. тому`, statusClass: 'overdue' };
    if (days <= 14) return { text: `${days} дн.`, statusClass: 'urgent' };
    return { text: `${days} дн.`, statusClass: 'normal' };
};

// Функція для перенесення дати з вихідних на п'ятницю
export const adjustForWeekends = (date) => {
    if (date.getDay() === 0) return subDays(date, 2); // Неділя -> П'ятниця
    if (date.getDay() === 6) return subDays(date, 1); // Субота -> П'ятниця
    return date;
};

// Розрахунок наступних дат
export const calculateNextDates = (lastDlp, frequency) => {
    let dlpDate = parseISO(lastDlp);
    const now = new Date();
    
    const count = parseInt(frequency);

    // Додаємо період, поки дата не стане МАЙБУТНЬОЮ відносно сьогодні
    // Це виправить помилку з 2027 роком
    while (dlpDate <= now) {
        if (frequency.includes('місяц')) {
            dlpDate = addMonths(dlpDate, count);
        } else {
            dlpDate = addYears(dlpDate, count);
        }
    }

    // 4. Визначаємо термін подання (70 або 90 днів)
    // Логіка: якщо період <= 1 року (6 міс або 1 рік) -> 70 днів, інакше -> 90 днів
    const isShort = frequency.includes('6 місяц') || frequency.includes('1 рік');
    const daysToAdd = isShort ? 70 : 90;
    
    let deadline = addDays(dlpDate, daysToAdd);

    return {
        nextDlp: format(adjustForWeekends(dlpDate), 'yyyy-MM-dd'),
        nextDeadline: format(adjustForWeekends(deadline), 'yyyy-MM-dd')
    };
};