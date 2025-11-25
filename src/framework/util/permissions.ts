/**
 * Permissions
 *
 *
 */
import { Platform } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import { check, checkMultiple, Permission, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';

export type PermissionScenario = undefined | false | Permission | Permission[];
export type PermissionDeclaration = Parameters<typeof Platform.select<PermissionScenario>>[0];

export const ANDROID_10_SDK = 29;

const ALL_PERMISSIONS = {
  'camera': {
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  },
  'documents.read': {
    android: DeviceInfo.getApiLevelSync() < ANDROID_10_SDK && PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  },
  'documents.write': {
    android: DeviceInfo.getApiLevelSync() < ANDROID_10_SDK && PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  },
  'galery.read': {
    android: DeviceInfo.getApiLevelSync() < ANDROID_10_SDK && PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  },
  'galery.write': {
    android: DeviceInfo.getApiLevelSync() < ANDROID_10_SDK && PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  },
} as Record<string, PermissionDeclaration>;

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

const checkPermission = async (sce: PermissionScenario): Promise<[Permission, PermissionStatus][]> => {
  if (!sce) return [];
  else if (Array.isArray(sce)) return checkMultiple(sce).then(r => Object.entries(r) as [Permission, PermissionStatus][]);
  else return check(sce).then(v => [[sce, v]] as [Permission, PermissionStatus][]);
};

const invalidPermissionResults: PermissionStatus[] = [RESULTS.BLOCKED, RESULTS.DENIED, RESULTS.UNAVAILABLE];

/**
 * Asserts the permissions needed for a scenario are granted.
 * Asks the user the permission if needed.
 * Throws an error if permission is not granted or limited.
 * Pass doNotThrow parameter to return the result even if not granted nor limited.
 * @param scenario
 * @returns Result pairs of [Permission, PermissionStatus]. every PermissionStatus is 'granted' or 'limited' when everything is fine.
 */
export const assertPermissions = async (scenario: keyof typeof ALL_PERMISSIONS, doNotThrow?: boolean) => {
  const res = await checkPermission(Platform.select(ALL_PERMISSIONS[scenario]));

  for (const k in res) {
    if (res[k][1] === RESULTS.DENIED) {
      res[k][1] = await request(res[k][0]);
    }
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
