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
 * Get difference between two objects.
 * @param object1
 * @param object2
 */
export const getDifference = (object1: Record<string, any>, object2: Record<string, any>) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  let extraDataObject1: Record<string, any> = {};
  let extraDataObject2: Record<string, any> = {};
  for (let key of keys1) {
    if (!keys2.includes(key)) extraDataObject1[key] = object1[key];
  }
  for (let key of keys2) {
    if (!keys1.includes(key)) extraDataObject2[key] = object2[key];
  }
  return { extraDataObject1, extraDataObject2 };
};
