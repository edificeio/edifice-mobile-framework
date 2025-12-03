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

export class PermissionError extends Error {
  value: PermissionStatus;

  permission: Permission;

  constructor(message: string, permission: Permission, value: PermissionStatus) {
    super(message);
    this.name = 'PermissionError';
    this.permission = permission;
    this.value = value;
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

  const missingPermissions = res.filter(([_k, v]) => invalidPermissionResults.includes(v));

  if (!doNotThrow && missingPermissions.length > 0) {
    throw new PermissionError(
      `Assert permission scenario "${scenario} not granted. Permissions not granted : \n - ${missingPermissions.map(pair => `${pair[0]} -> ${pair[1]}`).join('\n - ')}"`,
      missingPermissions[0][0],
      missingPermissions[0][1],
    );
  }

  return res;
};
