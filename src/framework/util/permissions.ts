// Permission handler
import { Platform } from 'react-native';

import DeviceInfo from 'react-native-device-info';
import { check, Permission, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';

const permissionsScenarios = {
  'camera': Platform.select<true | Permission>({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  })!,
  'documents.read': Platform.select<true | Permission>({
    android: DeviceInfo.getApiLevelSync() >= 33 ? true : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'documents.write': Platform.select<true | Permission>({
    android: DeviceInfo.getApiLevelSync() >= 33 ? true : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    ios: true,
  })!,
  'galery.read': Platform.select<true | Permission>({
    android: DeviceInfo.getApiLevelSync() >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  })!,
};

/**
 * Asserts the permissions needed for a scenario are granted.
 * Asks the user the permission if needed.
 * Throws an error if permission is not granted or limited.
 * Pass doNotThrow parameter to return the result even if not granted nor limited.
 * @param scenario
 * @returns Result can be "granted" or "limited".
 */
export const assertPermissions = async (scenario: keyof typeof permissionsScenarios, doNotThrow?: boolean) => {
  const getPermission = async (sce: true | Permission) => (sce === true ? RESULTS.GRANTED : check(sce));

  let res = await getPermission(permissionsScenarios[scenario]);

  if (res === RESULTS.DENIED) {
    res = await request(permissionsScenarios[scenario] as Permission);
  }
  if (!doNotThrow && ([RESULTS.BLOCKED, RESULTS.DENIED, RESULTS.UNAVAILABLE] as PermissionStatus[]).includes(res)) {
    throw new Error(`Assert permission "${scenario} not granted. Status is ${res}"`);
  }

  return res;
};
