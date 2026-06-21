import { parseLocalDate, toIsoDateString } from './business-days.util';

const buildDateMonthsBefore = (fechaVencimiento: string, monthsBefore: number): Date => {
  const expiryDate = parseLocalDate(fechaVencimiento);

  return new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth() - monthsBefore,
    expiryDate.getDate(),
    12,
    0,
    0,
    0,
  );
};

export const isExactlyMonthsBeforeExpiry = (
  fechaVencimiento: string,
  monthsBefore: number,
  referenceDate: Date | string = new Date(),
): boolean => {
  const alertDate = buildDateMonthsBefore(fechaVencimiento, monthsBefore);

  return (
    toIsoDateString(alertDate) === toIsoDateString(parseLocalDate(referenceDate))
  );
};

export const diffCalendarMonthsUntil = (
  fromDate: Date | string,
  fechaVencimiento: string,
): number => {
  const start = parseLocalDate(fromDate);
  const end = parseLocalDate(fechaVencimiento);

  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};
