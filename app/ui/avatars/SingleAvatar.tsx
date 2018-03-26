import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "./Avatar";

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
	slideIndex: number
}

export const SingleAvatar = ({ userId, size = 45 }) => <Avatar size={ Size.large } id={ userId } width={ size } />;