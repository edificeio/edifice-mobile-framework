import style from "glamorous-native"
import * as React from "react"
import { Avatar, Size } from "./Avatar";
import { ImageURISource } from "react-native";

export interface IAvatarsProps {
	users: Array<string | ImageURISource>;
}

export class GridAvatars extends React.Component<IAvatarsProps> {

	public render() {
		const { users } = this.props

		if (users.length > 4) {
			users.length = 4
        }
        
		return (
			<Container>
				{users.map((user, idx) => <Avatar size={Size.small} key={idx} index={idx} count={users.length} sourceOrId={user} />)}
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
