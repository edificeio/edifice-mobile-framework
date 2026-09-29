export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type KeysOfUnion<T> = T extends T ? keyof T : never;

export type ValueFromUnion<T, K extends KeysOfUnion<T>> = T extends Record<K, unknown> ? T[K] : never;
