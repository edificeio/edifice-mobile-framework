import style from "glamorous-native"
import * as React from "react"
import { View, Text, Image, ScrollView, Modal, Dimensions, Animated, Platform } from "react-native";
import { Row, Icon } from ".";
import { StackNavigator } from "react-navigation";
import FitImage from 'react-native-fit-image';

const Close = style.touchableOpacity({
	height: 40,
	width: 40,
	borderRadius: 20,
	alignItems: 'center',
	justifyContent: 'center',
	position: 'absolute',
	top: Platform.OS === "ios" ? 20 : 0,
	right: 0
});

const BubbleText = style.text({
	color: '#FFFFFF',
	textAlign: 'center'
})

const ContainerImage = style.view({
	marginTop: 15
});

const SoloImage = style.touchableOpacity({
	width: '100%'
});

const QuarterImage = style.touchableOpacity({
	width: '100%'
});

const Overlay = style.touchableOpacity({
	width: '100%',
	position: 'absolute',
	bottom: 0,
	right: 0,
	backgroundColor: 'rgba(0,0,0,0.5)'
});

const Column = style.view({
	width: '50%',
	justifyContent: 'space-between'
});

const StretchImage = style.image({
	width: '100%',
	height: '100%'
});

export class Images extends React.Component<{ images: object[] }, any> {
	state = {
		fullscreen: false
	};

	root: any;
	carouselRef: any;
	currentScroll = 0;
	previousScroll = 0;
	currentImage = 0;

	setNativeProps (nativeProps) {
		this.root.setNativeProps(nativeProps);
	}

	slideToImage(e){
		const { width, height } = Dimensions.get('window');
		const left = this.previousScroll - this.currentScroll > width / 5;
		const right = this.previousScroll - this.currentScroll < -width / 5;

		if(right){
			console.log('right')
		}
		if(left){
			console.log('left')
		}
		let newPosition = Math.floor((this.currentScroll / width)) * width;
		if(right){
			newPosition += width;
		}
		if(newPosition < 0){
			newPosition = 0;
		}
		this.carouselRef.scrollTo({ x: newPosition, animated: true });
		this.previousScroll = newPosition;
	}

	openImage(index){
		this.setState({ fullscreen: true });
		this.currentImage = index;
	}

	scrollToCurrentImage(){
		const { width, height } = Dimensions.get('window');
		let newPosition = this.currentImage * width;
		this.carouselRef.scrollTo({ x: newPosition, animated: true });
	}

	carousel(){
		const { width, height } = Dimensions.get('window');
		return (
			<Modal visible={ this.state.fullscreen } onRequestClose={ () => this.setState({ fullscreen: false })} transparent={ true }>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.90)'}} ref={ component => this.root = component }>
					<ScrollView 
						ref={ e => this.carouselRef = e }
						horizontal={ true } 
						style={{ flex: 1, flexDirection: 'row', height: '100%' }} 
						contentContainerStyle={{ justifyContent: 'center' }}
						onScroll={ (e) => this.currentScroll = e.nativeEvent.contentOffset.x  }
						scrollEventThrottle={16}
						onTouchEnd={ (e) => this.slideToImage(e) }
						onContentSizeChange={ () => this.scrollToCurrentImage() }
					>
						{ this.props.images.map((image, index) => (
						<View style={{ flex: 1, justifyContent: 'center'}} key={ index }>
							<FitImage resizeMode="contain" style={{ width: width, height: height }} source={ image } />
						</View>
					)) }
					</ScrollView>
					<Close onPress={ () => this.setState({ fullscreen: false })}>
						<Icon size={ 16 } color="#ffffff" name="close" />
					</Close>
				</View>
			</Modal>
		)
	}

	images(){
		const { width, height } = Dimensions.get('window');
		const { images } = this.props;

		const heightRatio = width * 0.6;

		if (images.length === 0) return <View />;
		if(images.length === 1){
		return (
			<SoloImage style={{ height: heightRatio }} onPress={ () => this.openImage(0) }>
				<StretchImage source={images[0]} />
			</SoloImage>);
		}
		if(images.length === 2){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<SoloImage style={{ height: heightRatio }} onPress={ () => this.openImage(0) }>
							<StretchImage source={images[0]} />
						</SoloImage>
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<SoloImage style={{ height: heightRatio }} onPress={ () => this.openImage(1) }>
							<StretchImage source={images[1]} />
						</SoloImage>
					</Column>
				</Row>
			);
		}
		if(images.length === 3){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<SoloImage style={{ height: heightRatio }} onPress={ () => this.openImage(0) }>
							<StretchImage source={images[0]} />
						</SoloImage>
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(1) }>
							<StretchImage source={images[1]} />
						</QuarterImage>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(2) }>
							<StretchImage source={images[2]} />
						</QuarterImage>
					</Column>
				</Row>
			);
		}
		if(images.length >= 4){
			return (
				<Row style={{ 'justifyContent': 'space-between'}}>
					<Column style={{ paddingRight: 5 }}>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(0) }>
							<StretchImage source={images[0]} />
						</QuarterImage>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(2) }>
							<StretchImage source={images[2]} />
						</QuarterImage>
					</Column>
					<Column style={{ paddingLeft: 5 }}>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(1) }>
							<StretchImage source={images[1]} />
						</QuarterImage>
						<QuarterImage style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(3) }>
							<StretchImage source={images[3]} />
						</QuarterImage>
						{ images.length > 4 && <Overlay style={{ height: heightRatio / 2 - 5 }} onPress={ () => this.openImage(3) }></Overlay> }
						{ images.length > 4 && <BubbleView style={{ bottom: (heightRatio / 4) - 15 }}>
							<BubbleText>+{ images.length - 4 }</BubbleText>
						</BubbleView> }
					</Column>
				</Row>
			);
		}
	}

	public render() {
		const { width, height } = Dimensions.get('window');
		const heightRatio = width * 0.6;

		const { images } = this.props;
		if (images.length === 0) return <View />;

		return (
			<View>
				<ContainerImage style={{ height: heightRatio }}>
					{ this.images() }
				</ContainerImage>
				{ this.carousel() }
			</View>
		)
	}
}

const BubbleView = style.view({
	position: 'absolute',
	backgroundColor: 'rgba(0,0,0,0.5)',
	width: 30,
	height: 30,
	padding: 5,
	borderRadius:15,
	left: '50%',
	marginLeft: -10
});