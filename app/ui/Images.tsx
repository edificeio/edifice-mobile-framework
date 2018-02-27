import style from "glamorous-native"
import * as React from "react"
import { View, Text, Image, ScrollView, Modal, Dimensions, Animated } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { Row, Icon } from ".";
import { StackNavigator } from "react-navigation";
import FitImage from 'react-native-fit-image';

export class Images extends React.Component<{ images: object[] }, any> {
	state = {
		fullscreen: false
	};

	carouselRef: any;
	currentScroll = 0;

	slideToImage(e){
		const { width, height } = Dimensions.get('window');
		const direction = this.currentScroll % width > width / 2;
		let newPosition = Math.floor((this.currentScroll / width)) * width;
		if(direction){
			newPosition += width;
		}
		this.carouselRef.scrollTo({ x: newPosition, animated: true });
	}

	carousel(){
		const { width, height } = Dimensions.get('window');
		return (
			<Modal visible={ this.state.fullscreen } onRequestClose={ () => this.setState({ fullscreen: false })} transparent={ true }>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.90)'}}>
					<ScrollView 
						ref={ e => this.carouselRef = e }
						horizontal={ true } 
						style={{ flex: 1, flexDirection: 'row', height: '100%' }} 
						contentContainerStyle={{ justifyContent: 'center' }}
						onScroll={ (e) => this.currentScroll = e.nativeEvent.contentOffset.x  }
						scrollEventThrottle={16}
						onTouchEnd={ (e) => this.slideToImage(e) }
					>
						{ this.props.images.map((image, index) => (
						<View style={{ flex: 1, justifyContent: 'center'}} key={ index }>
							<FitImage resizeMode="contain" style={{ width: width, height: height }} source={ image } />
						</View>
					)) }
					</ScrollView>
					<Icon size={ 16 } color="#ffffff" name="close" onPress={ () => this.setState({ fullscreen: false })} style={{ position: 'absolute', top: 10, right: 10 }} />
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
