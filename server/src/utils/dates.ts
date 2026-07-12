export const startOfDay = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const sameDay = (a: Date | string, b: Date | string) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();

export const formatDateKey = (value: Date | string) => startOfDay(value).toISOString();

