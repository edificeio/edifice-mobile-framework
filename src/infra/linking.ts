getInitialURL(): Promise<?string> {
  return Platform.OS === 'android'
    ? InteractionManager.runAfterInteractions().then(() =>
      NativeLinking.getInitialURL(),
    )
    : NativeLinking.getInitialURL();
}
