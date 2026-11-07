/**
 * Tools of React Native DevTools, with Rozenite (`yarn start:rozenite`). Nothing is done in production.
 * - Redux: by its enhancer (`src/app/store/debug.ts`).
 * - React Navigation: by the navigation container (`src/app/navigation-new/index.tsx`).
 * - Here: zustand (the stores listed below: add a new store to see it), storage (MMKV), file system, require profiler.
 */

import { createRNFSAdapter, useFileSystemDevTools } from '@rozenite/file-system-plugin';
import { useRequireProfilerDevTools } from '@rozenite/require-profiler-plugin';
import { createMMKVStorageAdapter, useRozeniteStoragePlugin } from '@rozenite/storage-plugin';
import RNFS from 'react-native-fs';
import { useZustandDevTools } from 'rozenite-zustand-devtools';

import { mmkvInstance } from '~/framework/util/storage/mmkv';
import { usePlatformReactionTypesStore } from '~/modules/audience/store';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';

const zustandStores: Parameters<typeof useZustandDevTools>[0] = [
  { name: 'auth/accounts', store: useAccountsStore },
  { name: 'auth/sign-in', store: useSignInStore },
  { name: 'auth/platform-context', store: usePlatformContextStore },
  { name: 'auth/platform-legal-urls', store: usePlatformLegalUrlsStore },
  { name: 'audience/reaction-types', store: usePlatformReactionTypesStore },
];

/** The MMKV of the app (`Storage.device` / `Storage.account` live in it). The keys that look like secrets are hidden. */
const storages = [createMMKVStorageAdapter({ blacklist: { app: /token|secret|password/i }, storages: { app: mmkvInstance } })];

const fileSystemAdapter = createRNFSAdapter(RNFS);

/** The tools of React Native DevTools that need nothing but the app. To call once, in the root of the app. */
export const useRozeniteDevTools = () => {
  useZustandDevTools(zustandStores);
  useRozeniteStoragePlugin({ storages });
  useFileSystemDevTools({ adapter: fileSystemAdapter });
  useRequireProfilerDevTools();
};
