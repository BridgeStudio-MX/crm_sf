export const toParksSelectValue = (label: string): string =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export const isParksSelectValueEqual = (
  storedValue: string | null | undefined,
  label: string,
): boolean => {
  if (!storedValue) {
    return false;
  }

  return (
    storedValue === label ||
    storedValue === toParksSelectValue(label) ||
    toParksSelectValue(storedValue) === toParksSelectValue(label)
  );
};
