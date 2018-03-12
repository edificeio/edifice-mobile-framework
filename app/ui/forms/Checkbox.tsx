import * as React from "react";
import style from "glamorous-native";
import { Icon } from "..";
import { CommonStyles } from '../../styles/common/styles';

const TapCircle = style.touchableOpacity(
    {
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        width: 25,
        height: 25
    }, 
    ({ checked = false }) => ({
        backgroundColor: checked ? CommonStyles.primary : '#FFFFFF',
        borderColor: checked ? CommonStyles.primary : '#DDDDDD',
        borderWidth: checked ? 0 : 2
    })
)

export const Checkbox = ({ checked, onUncheck, onCheck }: { checked: boolean, onUncheck?: () => void, onCheck?: () => void}) => (
	<TapCircle onPress={ () => checked ? (onUncheck && onUncheck()) : (onCheck && onCheck()) } checked={ checked }>
        <Icon size={ 17 } name={ "checked" } color={ "white" } />
    </TapCircle>
)