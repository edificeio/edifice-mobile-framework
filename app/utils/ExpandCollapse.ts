import { layoutSize } from "../constants/layoutSize"

export function tryUpScroll(navigation, nativeEvent) {
	if (nativeEvent.contentOffset.y > layoutSize.LAYOUT_4 && navigation.state.params.collapse !== true) {
		navigation.setParams({ collapse: true })
	}
}
