import style from "glamorous-native"
import * as React from "react"
import { View, Text, Image, ScrollView, Modal } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { Row } from ".";
import { StackNavigator } from "react-navigation";

export interface IAvatarsProps {
	images: object[];
}

export class Images extends React.Component<IAvatarsProps, any> {
	state = {
		fullscreen: false
	};

	carousel(){
		return (
			<Modal visible={ this.state.fullscreen } onRequestClose={ () => this.setState({ fullscreen: false })} transparent={ true }>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
					<ScrollView horizontal={ true } style={{ flex: 1, flexDirection: 'row', height: '100%' }} contentContainerStyle={{ justifyContent: 'center' }}>
						{ this.props.images.map(image => (<View style={{ flex: 1, justifyContent: 'center'}}>
							<Image style={{ width: 500, height: 250 }} source={ image } />
						</View>)) }
					</ScrollView>
				</View>
			</Modal>
		)
	}

	images(){
		const { images } = this.props;
		if (images.length === 0) return <View />;
		if(images.length === 1){
			return <SoloImage source={images[0]} />;
		}
		if(images.length === 2){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<SoloImage source={images[0]} />
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<SoloImage source={images[1]} />
					</Column>
				</Row>
			);
		}
		if(images.length === 3){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<SoloImage source={images[0]} />
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<QuarterImage source={images[1]} />
						<QuarterImage source={images[2]} />
					</Column>
				</Row>
			);
		}
		if(images.length >= 4){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<QuarterImage source={images[0]} />
						<QuarterImage source={images[2]} />
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<QuarterImage source={images[1]} />
						<QuarterImage source={images[3]} />
						{ images.length > 4 && <BubbleView>
							<BubbleText>+{ images.length - 4 }</BubbleText>
						</BubbleView> }
					</Column>
				</Row>
			);
		}
	}

	public render() {
		return (
			<View>
				<ContainerImage onPress={ () => this.setState({ fullscreen: true })}>
					{ this.images() }
				</ContainerImage>
				{ this.carousel() }
			</View>
		)
	}
}

const BubbleView = style.view({
	position: 'absolute',
	bottom: 24,
	backgroundColor: 'rgba(0,0,0,0.5)',
	width: 30,
	height: 30,
	padding: 5,
	borderRadius:15,
	left: '50%',
	marginLeft: -10
});

const BubbleText = style.text({
	color: '#FFFFFF',
	textAlign: 'center'
})

const ContainerImage = style.touchableHighlight({
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
