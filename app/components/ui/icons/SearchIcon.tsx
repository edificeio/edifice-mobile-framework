import React from "react"
import { layoutSize } from "../../../constants/layoutSize"
import { Icon } from "./Icon"

export const SearchIcon = () => (
	<Icon size={layoutSize.LAYOUT_22} name={"search"} color={"white"} />
)

export const CloseIcon = () => (
	<Icon size={layoutSize.LAYOUT_22} name={"close"} color={"white"} />
)
