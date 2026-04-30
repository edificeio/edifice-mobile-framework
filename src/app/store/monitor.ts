const monitorReducerEnhancer = createStore => (reducer, initialState, enhancer) => {
  const monitoredReducer = (state, action) => {
    const start = performance.now();
    const newState = reducer(state, action);
    const end = performance.now();
    const diff = Math.round((end - start) * 100) / 100;
    if (diff > 1000 / 60)
      console.warn(
        `[Redux] Action "${action?.type}" took ${diff}ms to be dispatched, skipping ${Math.floor((diff * 60) / 1000)} frames.`,
        action,
      );
    return newState;
  };

  return createStore(monitoredReducer, initialState, enhancer);
};

export default monitorReducerEnhancer;
