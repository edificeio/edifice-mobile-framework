import style from "glamorous-native"
import * as React from "react"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { Row } from "."

export interface IAvatarsProps {
	images: object[]
	full: boolean
}

export class Images extends React.Component<IAvatarsProps, any> {
	public render() {
		const { images } = this.props

		if (images.length === 0) return <View />

		if (images.length === 1) {
			return (
				<View style={{ aspectRatio: 1 }}>
					<Image source={images[0]} />
				</View>
			)
		}

		if (images.length === 2) {
			return (
				<View style={{ aspectRatio: 1 }}>
					<Row>
						<ImageLeft source={images[0]} />
						<ImageRight source={images[1]} />
					</Row>
				</View>
			)
		}

		if (images.length === 3) {
			return (
				<View style={{ aspectRatio: 1 }}>
					<Row>
						<ImageTop source={images[0]} />
						<View style={{ flex: 1 }}>
							<ImageBottomLeft source={images[1]} />
							<ImageBottomRight source={images[2]} />
						</View>
					</Row>
				</View>
			)
		}

		if (images.length === 4) {
			return (
				<View style={{ aspectRatio: 1 }}>
					<Row>
						<View style={{ flex: 1 }}>
							<ImageTopLeft source={images[0]} />
							<ImageTopRight source={images[2]} />
						</View>
						<View style={{ flex: 1 }}>
							<ImageBottomLeft source={images[1]} />
							<ImageBottomRight source={images[3]} />
						</View>
					</Row>
				</View>
			)
		}
	}
}

const Image = style.image({
	flex: 1,
	marginTop: 0,
	marginBottom: 0,
})

const ImageTop = style.image({
	flex: 1,
	marginBottom: layoutSize.LAYOUT_4,
})

const ImageBottom = style.image({
	flex: 1,
	marginTop: layoutSize.LAYOUT_4,
})

const ImageLeft = style.image({
	flex: 1,
	marginRight: layoutSize.LAYOUT_4,
})

const ImageRight = style.image({
	flex: 1,
	marginLeft: layoutSize.LAYOUT_4,
})

const ImageTopLeft = style.image({
	flex: 1,
	marginBottom: layoutSize.LAYOUT_4,
	marginRight: layoutSize.LAYOUT_4,
})

const ImageTopRight = style.image({
	flex: 1,
	marginTop: layoutSize.LAYOUT_4,
	marginLeft: layoutSize.LAYOUT_4,
})

const ImageBottomLeft = style.image({
	flex: 1,
	margin: layoutSize.LAYOUT_4,
})

const ImageBottomRight = style.image({
	flex: 1,
	margin: layoutSize.LAYOUT_4,
})
