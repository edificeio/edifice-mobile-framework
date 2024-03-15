declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

/**
 * These declaration fixes the wrong ones shipped with typescript 5.4.2.
 * JSON.stringify() can return `undefined` if given parameter is `undefined`.
 * This new declaration replaces the one build-in.
 * @see https://stackoverflow.com/questions/74461780/is-the-official-type-definition-for-json-stringify-wrong
 */
declare type JSONReturnType<T> = T extends undefined
  ? undefined
  : T extends bigint
    ? undefined
    : T extends symbol
      ? undefined
      : T extends Function
        ? undefined
        : string;
declare interface JSON {
  parse(text: string, reviver?: (this: any, key: string, value: any) => any): any;
  stringify<T>(value: T, replacer?: (this: any, key: string, value: any) => any, space?: string | number): JSONReturnType<T>;
  stringify<T>(value: T, replacer?: (number | string)[] | null, space?: string | number): JSONReturnType<T>;
}
