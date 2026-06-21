import { envConfig } from '../config/env.config';

const normalizeToLocalNoon = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);

  return normalized;
};

export const parseLocalDate = (value: Date | string): Date => {
  const datePart =
    typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  return normalizeToLocalNoon(new Date(value));
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();

  return day === 0 || day === 6;
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const isHoliday = (date: Date): boolean => {
  const holidaySet = new Set(envConfig.diasFestivosMx);

  return holidaySet.has(toDateKey(date));
};

export const isBusinessDay = (date: Date): boolean =>
  !isWeekend(date) && !isHoliday(date);

export const addBusinessDays = (
  startDate: Date | string,
  businessDays: number,
): Date => {
  const result = parseLocalDate(startDate);
  let remainingDays = businessDays;

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);

    if (isBusinessDay(result)) {
      remainingDays -= 1;
    }
  }

  return result;
};

export const countBusinessDaysBetween = (
  startDate: Date | string,
  endDate: Date | string,
): number => {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (end <= start) {
    return 0;
  }

  let count = 0;
  const cursor = new Date(start);

  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);

    if (isBusinessDay(cursor)) {
      count += 1;
    }
  }

  return count;
};

export const toIsoDateString = (date: Date): string => toDateKey(date);
