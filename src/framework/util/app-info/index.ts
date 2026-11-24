/**
 * Single entry point for app, build and device information.
 * Wraps react-native-device-info and the in-house BuildInfo TurboModule so callers never import them directly.
 */
import { Platform } from 'react-native';

import DeviceInfo from 'react-native-device-info';

import NativeBuildInfo from '~/specs/NativeBuildInfo';

/** Android API levels referenced by the app. */
export const ANDROID_API = {
  ANDROID_9: 28,
  ANDROID_10: 29,
  ANDROID_12L: 32,
  ANDROID_13: 33,
  ANDROID_16: 36,
} as const;

// Values below never change during the app lifetime: read them once at load time.
const app = {
  buildNumber: DeviceInfo.getBuildNumber(),
  bundleId: DeviceInfo.getBundleId(),
  name: DeviceInfo.getApplicationName(),
  readableVersion: DeviceInfo.getReadableVersion(),
  version: DeviceInfo.getVersion(),
} as const;

/** Keys filled by the native BuildInfo module (ios/appe/BuildInfo.mm, android/.../BuildInfoModule.kt). */
interface NativeBuildInfoValues {
  BundleVersionOverride: string;
  BundleVersionType: string;
}

const rawBuildInfo = NativeBuildInfo.fetchInfo();
// iOS returns an empty map when Info.plist is unreadable: fall back to '' so string helpers never crash.
const nativeBuildInfo: NativeBuildInfoValues = {
  BundleVersionOverride: rawBuildInfo.BundleVersionOverride ?? '',
  BundleVersionType: rawBuildInfo.BundleVersionType ?? '',
};

const build = {
  isAlpha: nativeBuildInfo.BundleVersionType.toLowerCase().startsWith('alpha'),
  override: nativeBuildInfo.BundleVersionOverride,
  overrideName: nativeBuildInfo.BundleVersionOverride.split('/')[0],
  type: nativeBuildInfo.BundleVersionType,
} as const;

const device = {
  // 0 on iOS so that numeric comparisons stay safe without a platform check.
  androidApiLevel: Platform.OS === 'android' ? DeviceInfo.getApiLevelSync() : 0,
  /** OS label, e.g. `iOS 18.1`. */
  getOsLabel: (): string => `${device.systemName} ${device.systemVersion}`,
  getUniqueId: (): Promise<string> => DeviceInfo.getUniqueId(),
  hasDynamicIsland: DeviceInfo.hasDynamicIsland(),
  hasNotch: DeviceInfo.hasNotch(),
  isEmulator: (): Promise<boolean> => DeviceInfo.isEmulator(),
  isTablet: DeviceInfo.isTablet(),
  model: DeviceInfo.getModel(),
  // Hardware model identifier (e.g. `iPhone7,2`), sent as the X-Device-Id header.
  modelId: DeviceInfo.getDeviceId(),
  systemName: DeviceInfo.getSystemName(),
  systemVersion: DeviceInfo.getSystemVersion(),
} as const;

export const AppInfo = {
  app,
  build,
  device,
} as const;

/** True on Android when the OS API level is greater than or equal to `level`, always false on iOS. */
export const isAndroidApiAtLeast = (level: number): boolean => Platform.OS === 'android' && device.androidApiLevel >= level;

/** Version label shared by tracking and support screens, e.g. `1.17.10-alpha (1234)`. */
export const fullVersionLabel = `${app.version}-${build.type} (${app.buildNumber})`;

/** Version and device details displayed on the debug and user screens. */
export const versionDetails = {
  buildNumber: app.buildNumber,
  buildType: build.type,
  deviceModel: device.model,
  os: device.systemName,
  osVersion: device.systemVersion,
  override: build.override,
  version: app.version,
} as const;

export default AppInfo;
