import style from "glamorous-native"
import * as React from "react"
import { Avatars } from "./Avatars"
import { CommonStyles } from "../styles/common/styles"
import { ContainerBar, LeftPanel, RightPanel } from "../ui/ContainerBar"
import { Icon } from "../ui/icons/Icon"
import { Size } from "../ui/Avatars/Avatar"
import { layoutSize } from "../../constants/layoutSize"
import { View } from "react-native"

export interface IThreadsBarProps {
	navigation?: any
}

const CenterPanel = style.touchableOpacity({
	alignItems: "center",
	flex: 1,
	justifyContent: "center",
	paddingTop: layoutSize.LAYOUT_2,
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
	}

	private onPress() {
		this.setState({ collapse: !this.state.collapse })
	}

	public render() {
		const { navigation } = this.props
		const { displayNames, subject } = navigation.state.params
		const { collapse } = this.state

		if (collapse)
			return (
				<ContainerBar collapse={true}>
					<LeftPanel>
						<Icon size={layoutSize.LAYOUT_24} name={"back"} color={"white"} onPress={() => navigation.goBack()} />
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
					<ContainerBar collapse={true}>
						<LeftPanel>
							<Icon size={layoutSize.LAYOUT_24} name={"back"} color={"white"} onPress={() => navigation.goBack()} />
						</LeftPanel>
						<CenterPanel onPress={() => this.onPress()}>
							<Text bigsize>{subject}</Text>
						</CenterPanel>
						<RightPanel>
							<Icon size={layoutSize.LAYOUT_24} name={"more"} color={"white"} />
						</RightPanel>
					</ContainerBar>
					<ContainerBar collapse={false}>
						<Avatars displayNames={displayNames} size={Size.verylarge} />
					</ContainerBar>
				</View>
			)
	}
}
