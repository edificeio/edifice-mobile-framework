/**
 * Flatten a nested object.
 * @param object
 */
// from https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-javascript-objects
export const flatten = (object: Record<string, any>) => {
  let result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (var i = 0, l = cur.length; i < l; i++) recurse(cur[i], prop + '[' + i + ']');
      if (l == 0) result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
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
 * Get duplicate values within an object.
 * @param object
 */
export const getDuplicateValues = (object: Record<string, any>) => {
  const keys = Object.keys(object);
  let duplicateValues: string[] = [];
  for (let key of keys) {
    if (duplicateValues.includes(object[key])) continue;
    for (let key2 of keys) {
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
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
};
