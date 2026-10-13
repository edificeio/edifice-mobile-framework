import { create } from 'zustand';

type State = {
  session?: {
    id: string;
  };
  requirement?: 'password';
};

type Action = {
  signIn: (session: NonNullable<State['session']>, requirement?: State['requirement']) => void;
  signOut: () => void;
};

export const useSignInStore = create<State & Action>()(set => ({
  requirement: undefined,
  session: undefined,
  signIn: (session, requirement) => set(() => ({ requirement, session })),
  signOut: () => set(() => ({ requirement: undefined, session: undefined })),
}));
