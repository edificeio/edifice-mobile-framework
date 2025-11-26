import { Platform } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import { check, checkMultiple, Permission, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';

import { I18n } from '~/app/i18n';
import toast from '~/framework/components/toast';

export type SinglePermissionRequirement = true | Permission;

export type PermissionRequirement = SinglePermissionRequirement | Permission[];

export const ANDROID_10 = 29;
export const ANDROID_13 = 33;
export const ANDROID_14 = 34;

const resolveGalleryWritePermission = (apiLevel: number): SinglePermissionRequirement => {
  if (apiLevel >= ANDROID_13) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }
  if (apiLevel < ANDROID_10) {
    return PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
  }
  return true;
};

const permissionI18nMap: Record<PermissionScenario, { title: string; text: string }> = {
  'camera': {
    text: 'camera-permissionblocked-text',
    title: 'camera-permissionblocked-title',
  },
  'documents.read': {
    text: 'documents-read-permissionblocked-text',
    title: 'documents-read-permissionblocked-title',
  },
  'documents.write': {
    text: 'documents-write-permissionblocked-text',
    title: 'documents-write-permissionblocked-title',
  },
  'gallery.read': {
    text: 'gallery-read-permissionblocked-text',
    title: 'gallery-read-permissionblocked-title',
  },
  'gallery.write': {
    text: 'gallery-write-permissionblocked-text',
    title: 'gallery-write-permissionblocked-title',
  },
} as const;

// ============================
// PERMISSION SCENARIOS
// ============================
const isAndroid = Platform.OS === 'android';
const api = isAndroid ? DeviceInfo.getApiLevelSync() : 0;

const permissionScenarios: Record<string, PermissionRequirement> = {
  'camera': Platform.select<SinglePermissionRequirement>({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  })!,
  'documents.read': Platform.select<SinglePermissionRequirement>({
    android: api >= ANDROID_10 ? true : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'documents.write': Platform.select<SinglePermissionRequirement>({
    android: api >= ANDROID_10 ? true : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'gallery.read': Platform.select<PermissionRequirement>({
    android: (() => {
      if (api >= ANDROID_14) return true;
      if (api >= ANDROID_13) {
        return [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];
      }
      if (api >= ANDROID_10) return true;
      return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    })(),
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  })!,

  'gallery.write': Platform.select<SinglePermissionRequirement>({
    android: resolveGalleryWritePermission(api),
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  })!,
};

export type PermissionScenario = keyof typeof permissionScenarios;

// ============================
// ERROR WRAPPER
// ============================
export class PermissionError extends Error {
  scenario: PermissionScenario;
  permission: Permission | 'unknown';
  status: PermissionStatus;

  constructor(scenario: PermissionScenario, permission: Permission | 'unknown', status: PermissionStatus) {
    super(`Permission "${scenario}" failed with status "${status}"`);
    this.scenario = scenario;
    this.permission = permission;
    this.status = status;
  }
}

// ============================
// HELPERS
// ============================
const checkPerm = async (sce: PermissionRequirement): Promise<[Permission, PermissionStatus][]> => {
  if (sce === true) return [];

  if (Array.isArray(sce)) {
    const result = await checkMultiple(sce);
    return Object.entries(result) as [Permission, PermissionStatus][];
  }

  const status = await check(sce);
  return [[sce, status]];
};

const BLOCKING_STATUSES = new Set<PermissionStatus>([RESULTS.BLOCKED, RESULTS.UNAVAILABLE]);
// ============================
// UI MESSAGE
// ============================
const showDeniedUI = (scenario: PermissionScenario) => {
  const appName = DeviceInfo.getApplicationName();
  const i18n = permissionI18nMap[scenario];

  if (!i18n) {
    console.warn(`[Permissions] Missing i18n entry for scenario "${scenario}"`);
    return;
  }

  const text = I18n.get(i18n.text, { appName });
  toast.showError(text);
};

// ============================
// MAIN ASSERT PERMISSIONS
// ============================
export const assertPermissions = async (scenario: PermissionScenario, options: { silent?: boolean } = {}) => {
  const needed = permissionScenarios[scenario];
  if (needed === true) return [];

  let res = await checkPerm(needed);

  // Request all DENIED permissions
  res = await Promise.all(
    res.map(async ([perm, status]): Promise<[Permission, PermissionStatus]> => {
      if (status !== RESULTS.DENIED) return [perm, status];

      try {
        const newStatus = await Promise.race([
          request(perm),
          new Promise<PermissionStatus>((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
        ]);

        return isAndroid && newStatus === RESULTS.DENIED ? [perm, RESULTS.BLOCKED] : [perm, newStatus];
      } catch {
        return [perm, RESULTS.BLOCKED];
      }
    }),
  );

  // Android 14 PhotoPicker: always allowed
  if (scenario === 'gallery.read' && isAndroid && api >= ANDROID_14) {
    return res;
  }

  const blocking = res.find(([, s]) => BLOCKING_STATUSES.has(s));
  const iosDenied = Platform.OS === 'ios' && res.some(([, s]) => s === RESULTS.DENIED);

  if (blocking || iosDenied) {
    if (!options.silent) showDeniedUI(scenario);
    throw new PermissionError(scenario, blocking?.[0] ?? 'unknown', blocking?.[1] ?? 'denied');
  }

  return res;
};

// ============================
// hasPermission
// ============================
export const hasPermission = async (scenario: PermissionScenario): Promise<boolean> => {
  const needed = permissionScenarios[scenario];
  if (needed === true) return true;

  const res = await checkPerm(needed);

  return res.every(([, status]) => status === RESULTS.GRANTED || status === RESULTS.LIMITED || status === RESULTS.DENIED);
};
