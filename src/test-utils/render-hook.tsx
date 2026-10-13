import React, { act } from 'react';

import { createRoot } from 'test-renderer';

/**
 * Renders a hook in a component and gives what it returns, like `renderHook` of the testing libraries.
 * `result.current` is always the last value returned. State updates have to be wrapped in `act`.
 * @param wrapper a component that wraps the one that uses the hook (to give it a context, for example)
 */
export const renderHook = <Result,>(
  hook: () => Result,
  { wrapper: Wrapper }: { wrapper?: React.ComponentType<React.PropsWithChildren> } = {},
) => {
  const result = { current: undefined as Result };
  const Probe = () => {
    result.current = hook();
    return null;
  };
  const root = createRoot();
  act(() => {
    root.render(
      Wrapper ? (
        <Wrapper>
          <Probe />
        </Wrapper>
      ) : (
        <Probe />
      ),
    );
  });
  return {
    result,
    unmount: () =>
      act(() => {
        root.unmount();
      }),
  };
};

export { act };
