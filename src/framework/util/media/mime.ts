export const mimeCompare = (a: string, b: string) => {
  const [a1, a2] = a.split('/');
  const [b1, b2] = b.split('/');

  if (a1 === '*' || b1 === '*') return 0;
  if (a1 !== b1) return a1.localeCompare(b1);
  if (a2 === '*' || b2 === '*') return 0;
  return a2.localeCompare(b2);
};
