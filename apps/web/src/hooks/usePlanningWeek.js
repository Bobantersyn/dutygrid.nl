import { useState } from "react";

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getWeekDates(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return {
    start: formatLocalDate(monday),
    end: formatLocalDate(sunday),
    dates: Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      return formatLocalDate(date);
    }),
    weekNumber: getWeekNumber(monday),
  };
}

export function usePlanningWeek() {
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [currentDate, setCurrentDate] = useState(new Date());

  const previousWeek = () => {
    const newDate = new Date(currentWeek.start);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(getWeekDates(newDate));
    setCurrentDate(new Date(newDate));
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek.start);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(getWeekDates(newDate));
    setCurrentDate(new Date(newDate));
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    setCurrentWeek(getWeekDates(newDate));
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    setCurrentWeek(getWeekDates(newDate));
  };

  const today = () => {
    const now = new Date();
    setCurrentDate(now);
    setCurrentWeek(getWeekDates(now));
  };

  const setDate = (dateStr) => {
    const newDate = new Date(dateStr);
    setCurrentDate(newDate);
    setCurrentWeek(getWeekDates(newDate));
  };

  return {
    currentWeek,
    currentDate,
    previousWeek,
    nextWeek,
    previousDay,
    nextDay,
    today,
    setDate,
  };
}

export { formatLocalDate };
