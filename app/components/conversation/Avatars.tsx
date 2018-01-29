import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "../ui/Avatars/Avatar"
import { layoutSize } from "../../constants/layoutSize"
import { CommonStyles } from "../styles/common/styles"

const Container = style.view({
	alignItems: "center",
	flex: 1,
	flexDirection: "row",
	flexWrap: "nowrap",
	justifyContent: "center",
})

const Legend = style.text({
	alignSelf: "center",
	color: "white",
	fontFamily: CommonStyles.primaryFontFamilyBold,
	marginTop: layoutSize.LAYOUT_8,
})

const Slide = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_120,
	paddingTop: layoutSize.LAYOUT_20,
	width: layoutSize.LAYOUT_120,
})

export interface IAvatarsProps {
	size?: Size
	displayNames: string[][]
}

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	},
	slideIndex: number,
}

const DEFAULT_AVATAR = "46c7bc61-b9dd-4c25-b164-fd6252236603"

export class Avatars extends React.Component<IAvatarsProps, IAvatarsState> {
	public state = {
		size: {
			height: 0,
			width: 0,
		},
		slideIndex: 0,
	}

	private onLayoutDidChange = e => {
		const layout = e.nativeEvent.layout
		this.setState({ size: { width: layout.width, height: layout.height } })
	}

	private renderItem({ item, index }) {
		return (
			<Slide>
				<Avatar size={Size.verylarge} index={index} id={item[0]} />
				{this.state.slideIndex === index && <Legend>{item[1]}</Legend>}
			</Slide>
		)
	}

	public render() {
		const { size = Size.large, displayNames } = this.props
		const users = [...displayNames]

		if (users.length > 4) {
			users[3] = [DEFAULT_AVATAR, "Next..."]
			users.length = 4
		}

		if (users.length === 1) {
			return <Avatar size={Size.large} id={users[0][0]} />
		} else {
			if (size === Size.verylarge) {
				return (
					<Container onLayout={e => this.onLayoutDidChange(e)}>
						<Carousel
							activeSlideAlignment={"center"}
							data={users}
							enableMomentum={true}
							hasParallaxImages={true}
							inactiveSlideOpacity={0.7}
							inactiveSlideScale={1}
							itemWidth={layoutSize.LAYOUT_120}
							onSnapToItem={slideIndex => this.setState({ slideIndex })}
							removeClippedSubviews={false}
							renderItem={e => this.renderItem(e)}
							sliderWidth={layoutSize.LAYOUT_375}
						/>
					</Container>
				)
			}
			return (
				<Container>
					{users.map((user, idx) => <Avatar size={size} key={idx} index={idx} count={users.length} id={user[0]} />)}
				</Container>
			)
		}
	}
}
