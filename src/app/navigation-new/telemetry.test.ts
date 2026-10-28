import { Trackers } from '~/framework/util/tracker';
import { renderHook } from '~/test-utils/render-hook';

import { useScreenTelemetry } from './telemetry';

jest.mock('@react-navigation/native', () => ({
  findFocusedRoute: (state: { index: number; routes: unknown[] }) => state.routes[state.index],
}));
jest.mock('~/framework/util/tracker', () => ({ Trackers: { trackView: jest.fn() } }));

const trackView = Trackers.trackView as jest.Mock;
const stateOn = (name: string) =>
  ({ index: 0, key: 'k', routeNames: [name], routes: [{ key: name, name }], stale: false, type: 'stack' }) as never;

describe('useScreenTelemetry', () => {
  beforeEach(() => trackView.mockClear());

  it('tracks the focused route once, not again while it stays', () => {
    const { result } = renderHook(() => useScreenTelemetry());
    result.current.logNavigationState(stateOn('a/home'));
    result.current.logNavigationState(stateOn('a/home'));
    expect(trackView.mock.calls).toEqual([[['a', 'home']]]);
  });

  it('does not track the ignored routes, and still tracks the others after', () => {
    const ignoredRoutes = new Set(['auth/load-account']);
    const { result } = renderHook(() => useScreenTelemetry({ ignoredRoutes }));
    result.current.logNavigationState(stateOn('auth/load-account'));
    expect(trackView).not.toHaveBeenCalled();
    result.current.logNavigationState(stateOn('a/home'));
    expect(trackView.mock.calls).toEqual([[['a', 'home']]]);
  });

  it('tracks a route by its name, before the screens it hosts (a container that tracks itself)', () => {
    const { result } = renderHook(() => useScreenTelemetry());
    result.current.logRoute('auth/load-account');
    result.current.logNavigationState(stateOn('auth/accounts'));
    expect(trackView.mock.calls).toEqual([[['auth', 'load-account']], [['auth', 'accounts']]]);
  });
});
