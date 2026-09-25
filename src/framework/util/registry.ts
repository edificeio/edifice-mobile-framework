import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface RegistryEntry {
  name: string;
  displayOrder: number;
  isVisible: (session: AuthActiveAccount) => boolean;
  renderComponent: (session: AuthActiveAccount) => React.ReactNode;
}

/**
 * Collects what the modules expose to a host screen, which knows none of them. The name identifies
 * an entry, so registering the same one twice replaces it, and the entries come back sorted based
 * on the `displayOrder` of each entry.
 */
export const createRegistry = () => {
  const entries = new Map<string, RegistryEntry>();

  const register = (entry: RegistryEntry) => {
    entries.set(entry.name.toLowerCase(), entry);

    return entry;
  };

  const getAll = (): ReadonlyArray<RegistryEntry> => [...entries.values()].sort((a, b) => a.displayOrder - b.displayOrder);

  return { getAll, register };
};
