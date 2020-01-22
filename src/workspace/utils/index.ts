export function nbItems(items) {
  return Object.keys(items).length;
}

export function getFirstItem(items) {
  return Object.values(items)[0];
}

export function isEmpty(items) {
  return nbItems(items) === 0;
}
