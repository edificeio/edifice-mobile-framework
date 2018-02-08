import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "./Avatar"
import { layoutSize } from "../constants/layoutSize"

export interface IAvatarsProps {
	images: string[]
	onSlideIndex?: (index: number) => void
	size?: Size
}

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
	slideIndex:number
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

	private renderItem({ item, index }) {
		return (
			<Slide>
				<Avatar size={Size.verylarge} index={index} id={item} decorate={index === this.state.slideIndex} />
			</Slide>
		)
	}

	private onSnapToItem(slideIndex) {
		this.props.onSlideIndex && this.props.onSlideIndex(slideIndex)
		this.setState({ slideIndex })
	}

	public render() {
		const { size = Size.large, images } = this.props

		if (images.length > 4) {
			images[3] = DEFAULT_AVATAR
			images.length = 4
		}

		if (size === Size.verylarge) {
			return (
				<Container>
					<Carousel
						activeSlideAlignment={"center"}
						data={images}
						enableMomentum={true}
						inactiveSlideOpacity={0.7}
						inactiveSlideScale={0.97}
						itemHeight={layoutSize.LAYOUT_80}
						itemWidth={layoutSize.LAYOUT_100}
						onSnapToItem={index => this.onSnapToItem(index)}
						removeClippedSubviews={false}
						renderItem={e => this.renderItem(e)}
						sliderHeight={layoutSize.LAYOUT_80}
						sliderWidth={layoutSize.LAYOUT_375}
					/>
				</Container>
			)
		}

		if (images.length === 1) {
			return <Avatar size={size} id={images[0]} />
		}

		return (
			<Container>
				{images.map((image, idx) => <Avatar size={size} key={idx} index={idx} count={images.length} id={image} />)}
			</Container>
		)
	}
}

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
	width: layoutSize.LAYOUT_100,
})
