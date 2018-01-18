import React from 'react'
import {navigate} from '../../../utils/navHelper'
import {Icon} from "./Icon";
import {layoutSize} from "../../../constants/layoutSize";

export const SearchIcon =  ({ onPress = () => navigate(screen), screen} ) => (
    <Icon onPress={onPress} size={layoutSize.LAYOUT_20} name={'search'} color={'white'}/>
)

export const CloseIcon = ({onPress}) => (
    <Icon onPress={() => onPress()} size={layoutSize.LAYOUT_20} name={'close'} color={'white'}/>
)
