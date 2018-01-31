import style from "glamorous-native"
import * as React from "react"
import { Avatars } from "./Avatars"
import { CommonStyles } from "../styles/common/styles"
import { ContainerEndBar, TouchableBarPanel, CenterPanel, ContainerTopBar, Text } from "../ui/ContainerBar"
import { Icon } from "../ui/icons/Icon"
import { Size } from "../ui/Avatars/Avatar"
import { layoutSize } from "../../constants/layoutSize"
import { View } from "react-native"

export interface IThreadsBarProps {
	navigation?: any
}

export class ThreadsTopBar extends React.PureComponent<IThreadsBarProps, {}> {
	public state = {
		collapse: true,
		slideIndex: 0,
	}

	private onPress() {
		this.setState({ collapse: !this.state.collapse })
	}

	private onSlideIndex(slideIndex) {
		this.setState({ slideIndex })
	}

	public render() {
		const { navigation } = this.props
		const { displayNames, subject } = navigation.state.params
		const { collapse } = this.state

		if (collapse)
			return (
				<ContainerTopBar>
					<TouchableBarPanel onPress={() => navigation.goBack()}>
						<Icon size={layoutSize.LAYOUT_22} name={"back"} color={"white"} />
					</TouchableBarPanel>
					<CenterPanel onPress={() => this.onPress()}>
						<Avatars displayNames={displayNames} size={Size.aligned} />
						<Text smallSize>{subject}</Text>
					</CenterPanel>
					<TouchableBarPanel>
						<Icon size={layoutSize.LAYOUT_22} name={"more"} color={"white"} />
					</TouchableBarPanel>
				</ContainerTopBar>
			)
		else
			return (
				<View>
					<ContainerTopBar>
						<TouchableBarPanel>
							<Icon size={layoutSize.LAYOUT_22} name={"back"} color={"white"} onPress={() => navigation.goBack()} />
						</TouchableBarPanel>
						<CenterPanel onPress={() => this.onPress()}>
							<Text>{subject}</Text>
						</CenterPanel>
						<TouchableBarPanel>
							<Icon size={layoutSize.LAYOUT_22} name={"more"} color={"white"} />
						</TouchableBarPanel>
					</ContainerTopBar>
					<ContainerEndBar>
						<Avatars
							onSlideIndex={slideIndex => this.onSlideIndex(slideIndex)}
							displayNames={displayNames}
							size={Size.verylarge}
						/>
						<Legend14>{displayNames[this.state.slideIndex][1]}</Legend14>
						<Legend12>{this.state.slideIndex === 0 ? "Enseignant CM1A" : "Parent d'élève"}</Legend12>
					</ContainerEndBar>
				</View>
			)
	}
}

const Legend14 = style.text({
	alignSelf: "center",
	color: "white",
	fontFamily: CommonStyles.primaryFontFamilyBold,
	height: layoutSize.LAYOUT_20,
	flexWrap: "nowrap",
})

const Legend12 = style.text({
	alignSelf: "center",
	color: "white",
	fontFamily: CommonStyles.primaryFontFamilyLight,
	height: layoutSize.LAYOUT_18,
	flexWrap: "nowrap",
	fontSize: layoutSize.LAYOUT_11,
	marginBottom: layoutSize.LAYOUT_25,
})
