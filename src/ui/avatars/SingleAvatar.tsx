import * as React from "react"
import { Avatar, Size } from "./Avatar";

export interface IAvatarsState {
	size?: {
		height: number
		width: number
	}
	slideIndex: number
	userId: string | {
		id: string;
		isGroup: boolean;
	  };
}

export const SingleAvatar = ({ userId, size = 45 }) => <Avatar size={ Size.large } sourceOrId={ userId } width={ size } />;