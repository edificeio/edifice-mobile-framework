/**
 * @todo: remove this file after the migration.
 *
 */

import type { Module } from '.';

export namespace Modules {
  /**
   * @deprecated
   */
  export const all = [];

  /**
   * @deprecated
   */
  export const getAllScopes = () => {
    return new Set();
  };

  /**
   * @deprecated
   */
  export const getAllOfType = <T extends typeof Module>(): InstanceType<T>[] => {
    return [];
  };
}
