import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "./Avatar";
import { layoutSize } from "..";

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
	slideIndex: number
}

export class SingleAvatar extends React.Component<{ userId: string }, IAvatarsState> {
	public state = {
		size: {
			height: 0,
			width: 0,
		},
		slideIndex: 0,
	}

	public render() {
        return <Avatar size={ Size.large } id={ this.props.userId } />
	}
}