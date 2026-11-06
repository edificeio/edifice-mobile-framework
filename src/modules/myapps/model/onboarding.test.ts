import { isOnboardingSeen, shouldShowOnboarding } from './onboarding';

describe('onboarding', () => {
  it('is seen only for the current version', () => {
    expect(isOnboardingSeen(undefined, 'v1')).toBe(false);
    expect(isOnboardingSeen('v1', 'v1')).toBe(true);
    expect(isOnboardingSeen('v1', 'v2')).toBe(false);
  });

  it('is shown when not seen, once per session', () => {
    expect(shouldShowOnboarding(undefined, false, 'v1')).toBe(true);
    expect(shouldShowOnboarding(undefined, true, 'v1')).toBe(false);
    expect(shouldShowOnboarding('v1', false, 'v1')).toBe(false);
  });

  it('is shown again for a new version', () => {
    expect(shouldShowOnboarding('v1', false, 'v2')).toBe(true);
  });
});
