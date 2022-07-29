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

/**
 * Flatten a nested object.
 * @param object
 */
// from https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-javascript-objects
export const flatten = (data: Record<string, any>) => {
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
  recurse(data, '');
  return result;
};

/**
 * Get duplicate values within an object.
 * @param object
 */
export const getDuplicateValues = (object: Record<string, any>) => {
  const keys = Object.keys(object);
  const keys2 = Object.keys(object);
  let duplicateValues: string[] = [];
  for (let key of keys) {
    for (let key2 of keys2) {
      if (object[key] === object[key2] && key !== key2 && !duplicateValues.includes(object[key])) {
        duplicateValues.push(object[key]);
      }
    }
  }
  return duplicateValues;
};
