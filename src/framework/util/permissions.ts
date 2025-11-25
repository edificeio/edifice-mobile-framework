import { Platform } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import { check, checkMultiple, Permission, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';

import { I18n } from '~/app/i18n';
import toast from '~/framework/components/toast';

export const ANDROID_10 = 29;
export const ANDROID_13 = 33;
export const ANDROID_14 = 34;

// ============================
// PERMISSION SCENARIOS
// ============================
const isAndroid = Platform.OS === 'android';
const api = isAndroid ? DeviceInfo.getApiLevelSync() : null;

const permissionScenarios: Record<string, true | Permission | Permission[]> = {
  'camera': Platform.select<true | Permission>({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  })!,
  'documents.read': Platform.select<true | Permission>({
    android: api! >= ANDROID_10 ? true : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'documents.write': Platform.select<true | Permission>({
    android: api! >= ANDROID_10 ? true : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'gallery.read': Platform.select<true | Permission | Permission[]>({
    android: (() => {
      if (api! >= ANDROID_14) return true;
      if (api! >= ANDROID_13) {
        return [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];
      }
      if (api! >= ANDROID_10) return true;
      return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    })(),
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  })!,

  'gallery.write': Platform.select<true | Permission>({
    android:
      DeviceInfo.getApiLevelSync() >= ANDROID_13
        ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
        : DeviceInfo.getApiLevelSync() < ANDROID_10
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : true,
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
const checkPerm = async (sce: true | Permission | Permission[]): Promise<[Permission, PermissionStatus][]> => {
  if (sce === true) return [];

  if (Array.isArray(sce)) {
    const result = await checkMultiple(sce);
    return Object.entries(result) as [Permission, PermissionStatus][];
  }

  const status = await check(sce);
  return [[sce, status]];
};

const BLOCKING_STATUSES: PermissionStatus[] = [RESULTS.BLOCKED, RESULTS.UNAVAILABLE];

// ============================
// UI MESSAGE
// ============================
const showDeniedUI = (scenario: PermissionScenario) => {
  const appName = DeviceInfo.getApplicationName();
  const key = `${scenario.replace('.', '-')}-permissionblocked-text`;
  const text = I18n.get(key, { appName });
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
  if (scenario === 'gallery.read' && isAndroid && api! >= ANDROID_14) {
    return res;
  }

  const blocking = res.find(([, s]) => BLOCKING_STATUSES.includes(s));
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
