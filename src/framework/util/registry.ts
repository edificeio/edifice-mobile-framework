import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface RegistryEntry {
  name: string;
  displayOrder: number;
  isVisible: (session: AuthActiveAccount) => boolean;
  renderComponent: (session: AuthActiveAccount) => React.ReactNode;
}

export const createRegistry = () => {
  const entries: RegistryEntry[] = [];

  const register = (entry: RegistryEntry) => {
    const existingIndex = entries.findIndex(e => e.name.toLowerCase() === entry.name.toLowerCase());

    if (existingIndex !== -1) entries.splice(existingIndex, 1);

    entries.push(entry);

    return entry;
  };

  const getAll = (): ReadonlyArray<RegistryEntry> => [...entries].sort((a, b) => a.displayOrder - b.displayOrder);

  return { getAll, register };
};
