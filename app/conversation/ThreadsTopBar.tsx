import style from "glamorous-native"
import * as React from "react"
import { Avatars } from "../ui/Avatars"
import { CommonStyles } from "../styles/common/styles"
import {
	TouchableBarPanel,
	TouchableEndBarPanel,
	CenterPanel,
	ContainerTopBar,
	CenterTextPanel,
} from "../ui/ContainerBar"
import { Icon } from "../ui/icons/Icon"
import { Size } from "../ui/Avatar"
import { layoutSize } from "../constants/layoutSize"
import { TextStyle } from "react-native"

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
		const { displayNames, subject } = navigation.state.params
		const { expand } = this.state
		const images = displayNames.reduce((acc, elem) => [...acc, elem[0]], [])

		return (
			<ContainerTopBar>
				<TouchableBarPanel onPress={() => navigation.goBack()}>
					<Icon size={layoutSize.LAYOUT_22} name={"back"} color={"white"} />
				</TouchableBarPanel>
				<CenterPanel onPress={() => this.onPress()}>
					{!expand && <Avatars images={images} size={Size.aligned} />}
					<CenterTextPanel smallSize={!expand}>{subject}</CenterTextPanel>
				</CenterPanel>
				<TouchableEndBarPanel>
					<Icon size={layoutSize.LAYOUT_22} name={"more"} color={"white"} />
				</TouchableEndBarPanel>
				{expand && (
					<ContainerAvatars>
						<Avatars onSlideIndex={slideIndex => this.onSlideIndex(slideIndex)} images={images} size={Size.verylarge} />
						<Legend14>{displayNames[this.state.slideIndex][1]}</Legend14>
						<Legend12>{this.state.slideIndex === 0 ? "Enseignant CM1A" : "Parent d'élève"}</Legend12>
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
