import style from "glamorous-native"
import * as React from "react"
import { View, Text } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { Row } from "."

export interface IAvatarsProps {
	images: object[];
}

export class Images extends React.Component<IAvatarsProps, any> {
	public render() {
		const { images } = this.props

		if (images.length === 0) return <View />

		if (images.length === 1) {
			return (
				<ContainerImage>
					<SoloImage source={images[0]} />
				</ContainerImage>
			)
		}

		if (images.length === 2) {
			return (
				<ContainerImage>
					<Row style={{ 'justifyContent': 'space-between'}}>
						<Column style={{ paddingRight: 5 }}>
							<SoloImage source={images[0]} />
						</Column>
						<Column style={{ paddingLeft: 5 }}>
							<SoloImage source={images[1]} />
						</Column>
					</Row>
				</ContainerImage>
			)
		}

		if (images.length === 3) {
			return (
				<ContainerImage>
					<Row style={{ 'justifyContent': 'space-between'}}>
						<Column style={{ paddingRight: 5 }}>
							<SoloImage source={images[0]} />
						</Column>
						<Column style={{ paddingLeft: 5 }}>
							<QuarterImage source={images[1]} />
							<QuarterImage source={images[2]} />
						</Column>
					</Row>
				</ContainerImage>
			)
		}

		if (images.length >= 4) {
			return (
				<ContainerImage>
					<Row style={{ 'justifyContent': 'space-between'}}>
						<Column style={{ paddingRight: 5 }}>
							<QuarterImage source={images[0]} />
							<QuarterImage source={images[2]} />
						</Column>
						<Column style={{ paddingLeft: 5 }}>
							<QuarterImage source={images[1]} />
							<QuarterImage source={images[3]} />
							{ images.length > 4 && <View style={{ position: 'absolute', bottom: 24, backgroundColor: 'rgba(0,0,0,0.5)', width: 30, height: 30,padding: 5, borderRadius:15, left: '50%', marginLeft: -10 }}>
								<Text style={{ color: '#FFFFFF', textAlign: 'center' }}>+{ images.length - 4}</Text>
							</View> }
						</Column>
					</Row>
				</ContainerImage>
			)
		}
	}
}

const ContainerImage = style.view({
	marginTop: 15,
	height: 165
});

const SoloImage = style.image({
	height: 165,
	width: '100%'
});

const HalfImage = style.image({
	height: 165,
	width: '49%'
});

const QuarterImage = style.image({
	height: 78,
	width: '100%'
});

const Column = style.view({
	width: '50%',
	height: 165,
	justifyContent: 'space-between'
});
