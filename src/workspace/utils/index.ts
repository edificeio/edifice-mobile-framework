export function nbItems(items) {
  if (!items) return 0;
  return Object.keys(items).length;
}
