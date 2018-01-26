import { layoutSize } from "../constants/layoutSize"

export function tryUpScroll(navigation, nativeEvent) {
	/*	if (nativeEvent.contentOffset.y === 0 && navigation.state.params.collapse === true) {
		navigation.setParams({ collapse: false })
		return
	}
*/
	if (nativeEvent.contentOffset.y > layoutSize.LAYOUT_200 && navigation.state.params.collapse !== true)
		navigation.setParams({ collapse: true })
}
