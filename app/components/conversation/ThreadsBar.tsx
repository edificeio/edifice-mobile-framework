import style from "glamorous-native"
import * as React from "react"
import { Avatars } from "./Avatars"
import { CommonStyles } from "../styles/common/styles"
import { CenterPanel, ContainerBar, ContainerEndBar, ContainerTopBar, LeftPanel, RightPanel } from "../ui/ContainerBar"
import { Icon } from "../ui/icons/Icon"
import { Size } from "../ui/Avatars/Avatar"
import { layoutSize } from "../../constants/layoutSize"
import { View } from "react-native"

export interface IThreadsBarProps {
	navigation?: any
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

const Text = style.text(
	{
		color: "white",
		fontFamily: CommonStyles.primaryFontFamily,
		fontWeight: "400",
	},
	({ bigsize = false }) => ({
		fontSize: bigsize ? layoutSize.LAYOUT_18 : layoutSize.LAYOUT_12,
		paddingTop: bigsize ? layoutSize.LAYOUT_12 : layoutSize.LAYOUT_2,
	})
)

export class ThreadsBar extends React.PureComponent<IThreadsBarProps, {}> {
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
				<ContainerBar>
					<LeftPanel onPress={() => navigation.goBack()}>
						<Icon size={layoutSize.LAYOUT_24} name={"back"} color={"white"} />
					</LeftPanel>
					<CenterPanel onPress={() => this.onPress()}>
						<Avatars displayNames={displayNames} size={Size.aligned} />
						<Text>{subject}</Text>
					</CenterPanel>
					<RightPanel>
						<Icon size={layoutSize.LAYOUT_24} name={"more"} color={"white"} />
					</RightPanel>
				</ContainerBar>
			)
		else
			return (
				<View>
					<ContainerTopBar>
						<LeftPanel>
							<Icon size={layoutSize.LAYOUT_24} name={"back"} color={"white"} onPress={() => navigation.goBack()} />
						</LeftPanel>
						<CenterPanel onPress={() => this.onPress()}>
							<Text bigsize>{subject}</Text>
						</CenterPanel>
						<RightPanel>
							<Icon size={layoutSize.LAYOUT_24} name={"more"} color={"white"} />
						</RightPanel>
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
