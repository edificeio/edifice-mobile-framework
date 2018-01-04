import React from 'react';
import {Image} from "react-native";
import {layoutSize} from "../../constants/layoutSize";
export interface IconProps {
    focused?: boolean
    name?: string,
}
import {Images} from "../../constants/Images";

const PATH_ICONS = "../../icons/"

export const IconSmall = ({name}) => <Image source={name} style={{height:layoutSize.LAYOUT_12, width:layoutSize.LAYOUT_16}}/>;
export const IconMedium = ({name}) => <Image source={name}/>;
export const IconBig = ({name}) => <Image source={name} style={{height:layoutSize.LAYOUT_12, width:layoutSize.LAYOUT_30}} />;

export const IconOnOff = ({focused = false, name}: IconProps) => {
    const imageName = focused ? `${name}_on` : `${name}_off`

    return <Image source={Images[imageName]}/>
}


export const Icon = IconMedium