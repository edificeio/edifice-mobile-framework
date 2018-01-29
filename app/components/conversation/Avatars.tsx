import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "../ui/Avatars/Avatar"
import { layoutSize } from "../../constants/layoutSize"

const Container = style.view({
	alignItems: "center",
	flex: 1,
	flexDirection: "row",
	flexWrap: "nowrap",
	justifyContent: "center",
})

const Slide = style.view({
	alignItems: "center",
	height: layoutSize.LAYOUT_80,
	width: layoutSize.LAYOUT_110,
})

export interface IAvatarsProps {
	displayNames: string[][]
	onSlideIndex?: (index: number) => void
	size?: Size
}

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
}

const DEFAULT_AVATAR = "46c7bc61-b9dd-4c25-b164-fd6252236603"

export class Avatars extends React.Component<IAvatarsProps, IAvatarsState> {
	public state = {
		size: {
			height: 0,
			width: 0,
		},
	}

	private onLayoutDidChange = e => {
		const layout = e.nativeEvent.layout
		this.setState({ size: { width: layout.width, height: layout.height } })
	}

	private renderItem({ item, index }) {
		return (
			<Slide>
				<Avatar size={Size.verylarge} index={index} id={item[0]} />
			</Slide>
		)
	}

	private onSnapToItem(slideIndex) {
		this.props.onSlideIndex && this.props.onSlideIndex(slideIndex)
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
							itemHeight={layoutSize.LAYOUT_80}
							itemWidth={layoutSize.LAYOUT_110}
							onSnapToItem={index => this.onSnapToItem(index)}
							removeClippedSubviews={false}
							renderItem={e => this.renderItem(e)}
							sliderHeight={layoutSize.LAYOUT_80}
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
