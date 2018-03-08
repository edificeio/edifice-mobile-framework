export function tryUpScroll(navigation, nativeEvent) {
	if (nativeEvent.contentOffset.y > 4 && navigation.state.params.collapse !== true) {
		navigation.setParams({ collapse: true })
	}
}
