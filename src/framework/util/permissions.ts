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

const isAndroid = Platform.OS === 'android';
const api = isAndroid ? DeviceInfo.getApiLevelSync() : 0;

const permissionI18nMap: Record<PermissionScenario, { title: string; text: string }> = {
  'audio.read': {
    text: 'audio-read-permissionblocked-text',
    title: 'audio-read-permissionblocked-title',
  },
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
};

/**
 * --------------------
 * PERMISSION SCENARIOS
 * --------------------
 */

export type PermissionScenario = 'camera' | 'gallery.read' | 'gallery.write' | 'documents.read' | 'documents.write' | 'audio.read';

const permissionScenarios = {
  'audio.read': Platform.select<PermissionRequirement>({
    android: api < ANDROID_10 ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : true,
    ios: true,
  })!,
  'camera': Platform.select<PermissionRequirement>({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  })!,
  'documents.read': Platform.select<PermissionRequirement>({
    android: api < ANDROID_10 ? PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : true,
    ios: true,
  })!,
  'documents.write': Platform.select<PermissionRequirement>({
    android: api < ANDROID_10 ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : true,
    ios: true,
  })!,
  'gallery.read': Platform.select<PermissionRequirement>({
    android: api >= ANDROID_13 ? true : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
  })!,
  'gallery.write': Platform.select<PermissionRequirement>({
    android: api < ANDROID_10 ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE : true,
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY,
  })!,
};

/**
 * --------------------
 * PERMISSION ERROR
 * --------------------
 */
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

/**
 * Check multiple perms
 */
const checkPerm = async (sce: PermissionRequirement): Promise<[Permission, PermissionStatus][]> => {
  if (sce === true) return [];

  if (Array.isArray(sce)) {
    const result = await checkMultiple(sce);
    return Object.entries(result) as [Permission, PermissionStatus][];
  }

  const status = await check(sce);
  return [[sce, status]];
};

const BLOCKING = new Set<PermissionStatus>([RESULTS.BLOCKED, RESULTS.UNAVAILABLE]);

/**
 * DENIED UI
 */
const showDeniedUI = (scenario: PermissionScenario) => {
  const appName = DeviceInfo.getApplicationName();
  const entry = permissionI18nMap[scenario];
  if (!entry) return;

  toast.showError(I18n.get(entry.text, { appName }));
};

/**
 * --------------------
 * MAIN PERMISSION ASSERT
 * --------------------
 */
export const assertPermissions = async (scenario: PermissionScenario, options: { silent?: boolean } = {}) => {
  const needed = permissionScenarios[scenario];
  if (needed === true) return [];

  // Initial check
  let res = await checkPerm(needed);

  // Request denied permissions
  res = await Promise.all(
    res.map(async ([perm, status]): Promise<[Permission, PermissionStatus]> => {
      if (status !== RESULTS.DENIED) return [perm, status];

      try {
        const newStatus = await request(perm);
        return [perm, newStatus];
      } catch {
        return [perm, RESULTS.BLOCKED];
      }
    }),
  );

  if (scenario === 'gallery.read' && isAndroid && api >= ANDROID_13) {
    return res;
  }

  const blocking = res.find(([, s]) => BLOCKING.has(s));
  const iosDenied = Platform.OS === 'ios' && res.some(([, s]) => s === RESULTS.DENIED);

  if (blocking || iosDenied) {
    if (!options.silent) showDeniedUI(scenario);
    throw new PermissionError(scenario, blocking?.[0] ?? 'unknown', blocking?.[1] ?? 'denied');
  }

  return res;
};

/**
 * --------------------
 * hasPermission
 * --------------------
 */
export const hasPermission = async (scenario: PermissionScenario): Promise<boolean> => {
  const needed = permissionScenarios[scenario];
  if (needed === true) return true;

  const res = await checkPerm(needed);

  return res.every(([, status]) => status === RESULTS.GRANTED || status === RESULTS.LIMITED || status === RESULTS.DENIED);
};
