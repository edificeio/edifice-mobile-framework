import style from "glamorous-native"
import * as React from "react";
import { CommonStyles } from "../styles/common/styles"
import {
	TouchableBarPanel,
	TouchableEndBarPanel,
	CenterPanel,
	ContainerTopBar,
	CenterTextPanel,
} from "../ui/ContainerBar"
import { Icon } from "../ui/icons/Icon";
import { layoutSize } from "../constants/layoutSize"
import { TextStyle } from "react-native"
import { RowAvatars } from "../ui/avatars/RowAvatars";
import { Size } from "../ui/avatars/Avatar";

export interface IThreadsBarProps {
	navigation?: any
}

export class ThreadsTopBar extends React.PureComponent<IThreadsBarProps, {}> {
	public state = {
		expand: false,
		slideIndex: 0,
	}

	private onPress() {
		this.setState({ expand: !this.state.expand })
	}

	private onSlideIndex(slideIndex) {
		this.setState({ slideIndex })
	}

	public render() {
		const { navigation } = this.props
		const { userId, displayNames, subject } = navigation.state.params
		const { expand } = this.state
		const images = displayNames.reduce(
			(acc, elem) => (userId === elem[0] && displayNames.length !== 1 ? acc : [...acc, elem[0]]),
			[]
		)
		const names = displayNames.reduce(
			(acc, elem) => (userId === elem[0] && displayNames.length !== 1 ? acc : [...acc, elem[1]]),
			[]
		)

		return (
			<ContainerTopBar>
				<TouchableBarPanel onPress={() => navigation.goBack()}>
					<Icon size={layoutSize.LAYOUT_22} name={"back"} color={"white"} />
				</TouchableBarPanel>
				<CenterPanel onPress={() => this.onPress()}>
					{!expand && <RowAvatars images={images} size={Size.aligned} />}
					<CenterTextPanel smallSize={!expand}>{subject}</CenterTextPanel>
				</CenterPanel>
				<TouchableEndBarPanel />
				{expand && (
					<ContainerAvatars>
						<RowAvatars onSlideIndex={slideIndex => this.onSlideIndex(slideIndex)} images={images} size={Size.verylarge} />
						<Legend14>{names[this.state.slideIndex]}</Legend14>
						<Legend12 />
					</ContainerAvatars>
				)}
			</ContainerTopBar>
		)
	}
}

const legendStyle: TextStyle = {
	alignSelf: "center",
	color: "white",
	flexWrap: "nowrap",
}

const Legend14 = style.text({
	...legendStyle,
	fontFamily: CommonStyles.primaryFontFamilyBold,
	height: layoutSize.LAYOUT_20,
})

const Legend12 = style.text({
	...legendStyle,
	fontFamily: CommonStyles.primaryFontFamilyLight,
	height: layoutSize.LAYOUT_18,
	fontSize: layoutSize.LAYOUT_11,
	marginBottom: layoutSize.LAYOUT_25,
})

export const ContainerAvatars = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_160,
	justifyContent: "flex-start",
})
