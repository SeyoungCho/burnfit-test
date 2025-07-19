import type { CalendarYearMonth, DayInfo } from "@/types/calendar";

export const getDaysInMonth = (year: number, month: number): DayInfo[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const endDayOfWeek = lastDay.getDay();

  const days: DayInfo[] = [];

  // 달력 첫째 주에 표기할 이전 월 날짜들 추가
  const prevMonth = new Date(year, month - 1, 1);
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = 0; i < startDayOfWeek; i++) {
    const day = prevMonthLastDay - (startDayOfWeek - i) + 1;
    days.push({
      day,
      date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day),
      isCurrentMonth: false,
    });
  }

  // 현재 월 날짜들 추가
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }

  // 달력 마지막 주에 표기할 다음 월 날짜들 추가
  const nextMonthDaysNeeded = endDayOfWeek === 6 ? 0 : 6 - endDayOfWeek;
  const nextMonth = new Date(year, month + 1, 1);

  for (let day = 1; day <= nextMonthDaysNeeded; day++) {
    days.push({
      day,
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day),
      isCurrentMonth: false,
    });
  }

  return days;
};

export const getNextYearMonth = (currentYearMonth: CalendarYearMonth) => {
  const nextMonth = (currentYearMonth.month + 1) % 12;
  const nextYear =
    nextMonth === 0 ? currentYearMonth.year + 1 : currentYearMonth.year;
  return {
    year: nextYear,
    month: nextMonth,
  };
};

export const getPrevYearMonth = (currentYearMonth: CalendarYearMonth) => {
  const prevMonth =
    currentYearMonth.month === 0 ? 11 : currentYearMonth.month - 1;
  const prevYear =
    prevMonth === 11 ? currentYearMonth.year - 1 : currentYearMonth.year;

  return {
    year: prevYear,
    month: prevMonth,
  };
};
