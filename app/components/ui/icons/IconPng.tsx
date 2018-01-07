import React from 'react';
import {Image} from "react-native";
import {layoutSize} from "../../../constants/layoutSize";
export interface IconPngProps {
    focused?: boolean
    name?: string,
    size?: number,
}

export const IconSmall = ({name}) => <Image source={name} style={{height:layoutSize.LAYOUT_12, width:layoutSize.LAYOUT_16}}/>;
export const IconMedium = ({name}) => <Image source={name}/>;
export const IconBig = ({name}) => <Image source={name} style={{height:layoutSize.LAYOUT_12, width:layoutSize.LAYOUT_30}} />;

export const Icon = IconMedium