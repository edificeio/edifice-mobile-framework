import * as React from 'react'

import {View, Keyboard, Animated, Platform, EmitterSubscription} from 'react-native';

import styles, {largeContainerSize, marginTopLargeContainerSize, largeImageSize, smallContainerSize, marginTopSmallContainerSize, smallImageSize} from './styles';

const ANIMATION_DURATION = 250;

export interface LogoProperties {
    tintColor?: string
};

export class Logo extends React.Component<LogoProperties, any> {
    keyboardDidShowListener: EmitterSubscription
    keyboardDidHideListener: EmitterSubscription
    state = {
        containerImageWidth: new Animated.Value(largeContainerSize),
        marginTopContainerImageWidth: new Animated.Value(marginTopLargeContainerSize),
        imageWidth: new Animated.Value(largeImageSize),
    };


    componentDidMount() {
        const name = Platform.OS === 'ios' ? 'Will' : 'Did';
        this.keyboardDidShowListener = Keyboard.addListener(
            `keyboard${name}Show`,
            () => this.keyboardWillShow(),
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            `keyboard${name}Hide`,
            () => this.keyboardWillHide(),
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    keyboardWillShow = () => {
        Animated.parallel([
            Animated.timing(this.state.containerImageWidth, {
                toValue: smallContainerSize,
                duration: ANIMATION_DURATION,
            }),
            Animated.timing(this.state.marginTopContainerImageWidth, {
                toValue: marginTopSmallContainerSize,
                duration: ANIMATION_DURATION,
            }),
            Animated.timing(this.state.imageWidth, {
                toValue: smallImageSize,
                duration: ANIMATION_DURATION,
            }),
        ]).start();
    };

    keyboardWillHide = () => {
        Animated.parallel([
            Animated.timing(this.state.containerImageWidth, {
                toValue: largeContainerSize,
                duration: ANIMATION_DURATION,
            }),
            Animated.timing(this.state.marginTopContainerImageWidth, {
                toValue: marginTopLargeContainerSize,
                duration: ANIMATION_DURATION,
            }),
            Animated.timing(this.state.imageWidth, {
                toValue: largeImageSize,
                duration: ANIMATION_DURATION,
            }),
        ]).start();
    };

    render() {
        const containerImageStyles = [
            styles.containerImage,
            { width: this.state.containerImageWidth, height: this.state.containerImageWidth},
        ];
        const imageStyles = [
            styles.logo,
            { width: this.state.imageWidth},
            this.props.tintColor ? { tintColor: this.props.tintColor } : null,
        ];
        const marginStyles = [
            styles.marginTopContainerImage,
            {height: this.state.marginTopContainerImageWidth, width: this.state.containerImageWidth }
        ];

        return (
            <View style={styles.container}>
                <Animated.View style={marginStyles} />
                <Animated.View style={containerImageStyles}>
                    <Animated.Image
                        resizeMode="contain"
                        style={imageStyles}
                        source={require('../../../../assets/icons/icon.png')}
                    />
                </Animated.View>
            </View>
        );
    }
}

