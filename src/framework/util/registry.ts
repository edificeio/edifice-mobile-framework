import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface RegistryEntry {
  name: string;
  displayOrder: number;
  isVisible: (session: AuthActiveAccount) => boolean;
  renderComponent: (session: AuthActiveAccount) => React.ReactNode;
}

export const createRegistryEntry = () => {
  const entries: RegistryEntry[] = [];

  const register = (entry: RegistryEntry) => {
    const existingIndex = entries.findIndex(e => e.name.toLowerCase() === entry.name.toLowerCase());

    if (existingIndex !== -1) entries.splice(existingIndex, 1);

    const insertIndex = entries.findIndex(e => e.displayOrder > entry.displayOrder);

    entries.splice(insertIndex === -1 ? entries.length : insertIndex, 0, entry);

    return entry;
  };

  const getAll = (): ReadonlyArray<RegistryEntry> => entries;

  return { getAll, register };
};
