import * as React from "react"
import { View, Dimensions } from "react-native";
import FitImage from "react-native-fit-image";
import { H1, Paragraph, Quote } from './Typography';
import { CommonStyles } from '../styles/common/styles';

export const EmptyScreen = ({ image, title, text }) => {
    const { width, height } = Dimensions.get('window');
    const imageSize = width * 60 / 100;
    const side = Math.sqrt((imageSize * imageSize) / 2);
    const textSize = imageSize * 1.2;

    return (
        <View style={{ justifyContent: 'space-around', alignItems: 'center', flex: 1, backgroundColor: CommonStyles.lightGrey }}>
            <View style={{ 
                flex: 1, 
                alignItems: 'flex-end', 
                width: textSize, 
                flexDirection: 'row', 
                justifyContent: 'center' 
            }}>
                <H1>{ title }</H1>
            </View>
            <View style={{ 
                height: imageSize, 
                width: imageSize, 
                borderRadius: imageSize / 2, 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}>
                <FitImage resizeMode="contain" style={{ width: side, height: side, marginTop: 20 }} source={ image } />
            </View>
            
            <Quote style={{ width: textSize, flex: 1, alignItems: 'flex-start' }}>{ text }</Quote>
        </View>
    );
}
