// Permission handler
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, Permission, PermissionStatus, RESULTS, check, request } from 'react-native-permissions';

const permissionsScenarios = {
  'documents.read': Platform.select<true | Permission>({
    ios: true,
    android: DeviceInfo.getApiLevelSync() >= 33 ? true : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  })!,
  'galery.read': Platform.select<true | Permission>({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: DeviceInfo.getApiLevelSync() >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  })!,
  camera: Platform.select<true | Permission>({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  })!,
  'documents.write': Platform.select<true | Permission>({
    ios: true,
    android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
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
