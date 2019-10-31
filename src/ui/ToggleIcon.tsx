import * as React from "react";
import style from "glamorous-native";
import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles"

const ToggleView = style.view(
	{
        backgroundColor: CommonStyles.secondary, 
        borderRadius: 15, 
        height: 30, 
        width: 30, 
        elevation: 1, 
        alignItems: "center", 
        justifyContent: "center"
	},
	({ show }) => ({
		opacity: show ? 1 : 0
	})
)

export const ToggleIcon = (props: { show: boolean, icon: string }) => {
	return (
        <ToggleView show={ props.show }>
            <Icon size={ 13 } name={ props.icon } color={ '#FFFFFF' } />
        </ToggleView>
    );
}