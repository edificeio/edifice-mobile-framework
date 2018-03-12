import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "./Avatar";
import { Text, View } from "react-native";
import { CommonStyles } from '../../styles/common/styles';

const SkippedContainer = style.view({
	borderRadius: 15,
	height: 29,
	width: 29,
	alignItems: 'center',
	justifyContent: 'center',
	marginLeft: -4,
	backgroundColor: '#FFFFFF'
})

const Skipped = style.text({
	color: CommonStyles.warning,
	textAlign: 'center',
	fontFamily: CommonStyles.primaryFontFamily,
	fontSize: 12
})

export interface IAvatarsProps {
	images: string[]
	onSlideIndex?: (index: number) => void
	size?: Size;
}

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
	slideIndex: number
}

export class RowAvatars extends React.Component<IAvatarsProps, IAvatarsState> {
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
		const { size = Size.verylarge, images } = this.props

		let skipped = 0;
		if (images.length > 4 && size !== Size.verylarge) {
			skipped = images.length - 3;
			images.length = 3;
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
						itemHeight={80}
						itemWidth={100}
						onSnapToItem={index => this.onSnapToItem(index)}
						removeClippedSubviews={false}
						renderItem={e => this.renderItem(e)}
						sliderHeight={80}
						sliderWidth={375}
					/>
				</Container>
			)
		}
		
		return (
			<Container>
				{ images.map((image, idx) => <Avatar size={ Size.aligned } key={idx} index={idx} count={images.length} id={image} />) }
				{ skipped ? <SkippedContainer><Skipped>+{ skipped }</Skipped></SkippedContainer> : <View /> }
			</Container>
		)
	}
}

const Container = style.view({
	alignItems: "center",
	flex: 1,
	flexDirection: "row",
	flexWrap: "nowrap",
    justifyContent: "center"
})

const Slide = style.view({
	alignItems: "center",
	height: 80,
	width: 100,
})
