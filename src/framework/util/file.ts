/**
 * Return a given file name extension
 * @param file
 */
export const getExtension = (file: string | undefined | null) => {
  if (!file) return null;
  const lastPoint = file.lastIndexOf('.');
  if (lastPoint === -1) return null;
  return file.slice(lastPoint);
};
