/**
 * Extract a short version of the task's description, to be shown on the landing diary page.
 * The short version stops at the first new line, or before SHORT_TEXK_MAX_SIZE characters (without cutting words).
 * The short version DOES include the ending "..." if necessary.
 * @param description description to be shortened.
 */
export function extractShortFromRawText(
  description,
  maxSize = SHORT_TEXT_MAX_SIZE,
  newLineChar = NEW_LINE_CHARACTER
) {
  const firstLine = description.split(newLineChar, 1)[0];
  let trimmedFirstLine = (firstLine + " ").substr(0, maxSize);
  trimmedFirstLine = trimmedFirstLine.substr(
    0,
    Math.min(trimmedFirstLine.length, trimmedFirstLine.lastIndexOf(" "))
  );
  trimmedFirstLine = trimmedFirstLine.trim();
  if (trimmedFirstLine.length !== description.length) trimmedFirstLine += "...";
  return trimmedFirstLine;
}
const SHORT_TEXT_MAX_SIZE: number = 70;
const NEW_LINE_CHARACTER: string = "\n";
