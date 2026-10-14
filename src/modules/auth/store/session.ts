import { create } from 'zustand';

import { AuthActiveAccount } from '../model';

type State = {
  session?: AuthActiveAccount;
  requirement?: 'password';
};

type Action = {
  signIn: (session: NonNullable<State['session']>, requirement?: State['requirement']) => void;
  signOut: () => void;
};

export const useSessionStore = create<State & Action>()(set => ({
  requirement: undefined,
  session: undefined,
  signIn: (session, requirement) => set(() => ({ requirement, session })),
  signOut: () => set(() => ({ requirement: undefined, session: undefined })),
}));

export const useSession = () => useSessionStore(s => s.session);
