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
