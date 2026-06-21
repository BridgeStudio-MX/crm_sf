export const toSelectValue = (label: string): string =>
  label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

export const isSelectValueEqual = (
  storedValue: string | null | undefined,
  label: string,
): boolean => {
  if (!storedValue) {
    return false;
  }

  return (
    storedValue === label ||
    storedValue === toSelectValue(label) ||
    toSelectValue(storedValue) === toSelectValue(label)
  );
};
