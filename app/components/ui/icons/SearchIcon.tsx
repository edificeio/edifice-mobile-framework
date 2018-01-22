import React from "react"
import { layoutSize } from "../../../constants/layoutSize"
import { navigate } from "../../../utils/navHelper"
import { Icon } from "./Icon"

export const SearchIcon = ({ onPress = () => navigate(screen), screen }) => (
	<Icon onPress={onPress} size={layoutSize.LAYOUT_20} name={"search"} color={"white"} />
)

export const CloseIcon = ({ onPress }) => (
	<Icon onPress={() => onPress()} size={layoutSize.LAYOUT_20} name={"close"} color={"white"} />
)
