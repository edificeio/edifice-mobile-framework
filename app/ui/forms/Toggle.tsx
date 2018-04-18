import * as React from "react";
import style from "glamorous-native";
import { Icon } from "..";
import { CommonStyles } from '../../styles/common/styles';
import { View } from 'react-native';

const TapCircle = style.touchableOpacity(
    {
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        width: 22,
        height: 22,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        left: 0,
        top: 0,
        borderWidth: 1,
        elevation: 2
    }, 
    ({ checked = false }) => ({
        borderColor: checked ? CommonStyles.primary : '#DDDDDD',
        left: checked ? 20 : 0
    })
)

const Container = style.touchableOpacity(
    {
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 22,
        borderColor: '#dddddd',
        position: 'absolute',
        left: 0,
        top: 0
    }, 
    ({ checked = false }) => ({
        backgroundColor: checked ? CommonStyles.primary : '#efefef',
        borderColor: checked ? CommonStyles.primary : '#DDDDDD',
        borderWidth: checked ? 0 : 1
    })
)

export const Toggle = ({ checked, onUncheck, onCheck }: { checked: boolean, onUncheck?: () => void, onCheck?: () => void}) => (
    <View style={{ width: 40, height: 22 }}>
        <Container onPress={ () => checked ? (onUncheck && onUncheck()) : (onCheck && onCheck()) } checked={ checked } />
        <TapCircle onPress={ () => checked ? (onUncheck && onUncheck()) : (onCheck && onCheck()) } checked={ checked } />
    </View>
)