import style from "glamorous-native"
import * as React from "react"
import Carousel from "react-native-snap-carousel"
import { Avatar, Size } from "./Avatar";

export interface IAvatarsProps {
	users: string[];
}

export class GridAvatars extends React.Component<IAvatarsProps, undefined> {

	public render() {
		const { users } = this.props

		if (users.length > 4) {
			users.length = 4
        }
        
		return (
			<Container>
				{users.map((image, idx) => <Avatar size={Size.small} key={idx} index={idx} count={users.length} id={image} />)}
			</Container>
		)
	}
}

const Container = style.view({
	alignItems: "center",
	flex: 1,
	flexDirection: "row",
	flexWrap: "nowrap",
	justifyContent: "center",
	width: 45,
	height: 45
});
