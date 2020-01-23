export function nbItems(items) {
  if (!items)
    return 0;
  return Object.keys(items).length;
}

export function getFirstItem(items) {
  if (!items)
    return null;
  return Object.values(items)[0];
}

export function isEmpty(items) {
  return nbItems(items) === 0;
}
