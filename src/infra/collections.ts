/**
 * Some collection type definitions and tools
 */

/**
 * A list of elements that have a `id` property. Elements can be acceded line collection[id]
 */
export interface IArrayById<T extends { id: any }> {
  [id: string]: T;
}

/**
 * An ordered list of elements that contains an `id` property.
 * `byId` contains the unordered elements (like IArrayById), `ids` contains the ordered ids.
 */
export interface IOrderedArrayById<T extends { id: any }> {
  byId: { [id: string]: T };
  ids: string[];
}
