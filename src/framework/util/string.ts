import unorm from 'unorm';

/**
 * Check if string is empty (only contains spaces).
 * @param str
 */
export const isStringEmpty = (str: string) => str.trim().length === 0;

/**
 * Uppercase the first letter of a string.
 * @param str
 */
export const uppercaseFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Return a string that have no more accents.
 * @param str
 */
// from https://stackoverflow.com/a/37511463/6111343 but using unorm package instead of String.normalize (not available on Android Release mode)
export const removeAccents = (str: string) => {
  const combiningChars = /[\u0300-\u036F]/g;
  return unorm.nfd(str).replace(combiningChars, '') as string;
};

/**
 * Remove the first word of a string.
 * @param str
 */
export const removeFirstWord = (str: string) => {
  const indexOfSpace = str.indexOf(' ');
  if (indexOfSpace === -1) return '';
  return str.substring(indexOfSpace + 1);
};

/**
 * Get a search query (an array of normalized string) from a input text.
 * Spaces are trimmed as separated words.
 * ToDo: make a special treatments for quoted strings
 * @param str
 * @returns
 */
export const computeSearchQuery = (str: string) => {
  return removeAccents(str).toLocaleLowerCase().split(/\s+/);
};

export const computeSearchValue = (str: string) => {
  return removeAccents(str).toLocaleLowerCase();
};

/**
 * Returns a converted string from camelCase (or UppercasedCamelCase) to snake_case.
 * @param camelCase
 */
export function toSnakeCase(camelCase: string) {
  const upperChars = camelCase.match(/([A-Z])/g);
  if (!upperChars) {
    return camelCase;
  }

  let str = camelCase;
  for (let i = 0, n = upperChars.length; i < n; i++) {
    str = str.replace(new RegExp(upperChars[i]), '_' + upperChars[i].toLowerCase());
  }

  if (str.slice(0, 1) === '_') {
    str = str.slice(1);
  }

  return str;
}

// From https://dev.to/cod3pineapple/1143-longest-common-subsequence-javascript-solution-5bgp
export const findLongestCommonSubstring = function (a: string, b: string) {
  var longest = '';
  // loop through the first string
  for (var i = 0; i < a.length; ++i) {
    // loop through the second string
    for (var j = 0; j < b.length; ++j) {
      // if it's the same letter
      if (a[i] === b[j]) {
        var str = a[i];
        var k = 1;
        // keep going until the letters no longer match, or we reach end
        while (
          i + k < a.length &&
          j + k < b.length && // haven't reached end
          a[i + k] === b[j + k]
        ) {
          // same letter
          str += a[i + k];
          ++k;
        }
        // if this substring is longer than the longest, save it as the longest
        if (str.length > longest.length) {
          longest = str;
        }
      }
    }
  }
  return longest;
};

/**
 * Split a string in a given number of lines. Tries to generate homogenous line lengths.
 * @param input the input string is not modified.
 * @param nbLines number of lines of the output (>= 1)
 * @param separator a string or a regex that represent a word separator. MUST HAVE CAPTURING PARENTHESIS if regex given. (\s+ by default)
 * @param newLine character or string to insert at every line. (\n by default)
 * @param minLength minimal length of a line
 * @returns The new string
 */
export function splitWords(
  input: string,
  nbLines: number,
  separator: string | RegExp = /(\s+)/g,
  newLine: string = '\n',
  minLength: number = 2,
) {
  if (nbLines <= 0) throw new Error(`splitWords lines cannot be zero or negatives`);
  let regex = typeof separator === 'string' ? new RegExp(separator.replace(/([-/\\^$*+?.()|[\]{}])/g, '\\$&')) : separator;
  if (!regex.global) {
    regex = new RegExp(regex, 'g');
  }
  const lineSize = input.length / nbLines;
  const words = input.split(regex);
  let output = '';
  let curLine = 0;
  let nbReturns = 0;
  words.forEach(word => {
    if (curLine + word.length > lineSize && curLine > minLength) {
      if (nbReturns < nbLines) output += newLine;
      ++nbReturns;
      curLine = 0;
    }
    output += word;
    curLine += word.length;
  });
  return output;
}
