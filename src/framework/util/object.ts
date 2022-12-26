/**
 * Test if given object contains given key or not.
 * @param something
 * @param key
 */
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export const containsKey = (something: object, key: string): boolean => !isEmpty(something) && Object.keys(something).includes(key);

/**
 * Test if given object contains given value or not.
 * @param something
 * @param key
 */
export const containsValue = (something: object, value: string): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  !isEmpty(something) && Object.values(something).includes(value);

/**
 * Flatten a nested object.
 * @param object
 */
// from https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-javascript-objects
export const flatten = (object: Record<string, any>) => {
  const result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      const l = cur.length;
      for (let i = 0; i < l; i++) recurse(cur[i], prop + '[' + i + ']');
      if (l === 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  };
  recurse(object, '');
  return result;
};

/**
 * Test if given parameter is empty or not.
 * @param something
 */
export const isEmpty = (something: any) => {
  if (something === null || something === undefined) return true;
  if (Array.isArray(something)) return something.length === 0;
  switch (typeof something) {
    case 'object':
      return Object.keys(something).length === 0;
    case 'string':
      return something.length === 0;
    case 'function':
      return something.length === 0;
    default:
      return false;
  }
};

/**
 * Get duplicate values within an object.
 * @param object
 */
export const getDuplicateValues = (object: Record<string, any>) => {
  const keys = Object.keys(object);
  const duplicateValues: string[] = [];
  for (const key of keys) {
    if (duplicateValues.includes(object[key])) continue;
    for (const key2 of keys) {
      if (key !== key2 && object[key] === object[key2]) {
        duplicateValues.push(object[key]);
        break;
      }
    }
  }
  return duplicateValues;
};

/**
 * Check if two objects are equal.
 * @param object1
 * @param object2
 */
// from https://dmitripavlutin.com/how-to-compare-objects-in-javascript
export const shallowEqual = (object1: Record<string, any>, object2: Record<string, any>) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
};
