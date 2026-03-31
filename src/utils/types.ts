export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
