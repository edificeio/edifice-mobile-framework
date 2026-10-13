# Test utilities

What the tests **import themselves** (`import … from '~/test-utils/…'`): fakes, helpers, ways to load modules.

What Jest **swaps in without the tests knowing** (a native package replaced everywhere, like `react-native-mmkv`) is not here, it is in `jest/mocks/`: see the header of `jest.config.js` for the three places a fake can live.

- `fake-storage-lib.ts`: an in-memory `StorageLib`, instead of MMKV (on top of the mock `react-native-mmkv` provides for tests).
- `storage-modules.ts`: `loadStorageModules()`, to load the storage modules with nothing declared, nothing migrated and an empty device storage.
- `render-hook.tsx`: `renderHook` (and `act`), to test a hook in a component.
