import style from "glamorous-native"
import * as React from "react"
import { Avatar, Size } from "./Avatar"

const Container = style.view({
	alignItems: "center",
	flex: 1,
	flexDirection: "row",
	flexWrap: "wrap",
	justifyContent: "center",
})

export interface AvatarsProps {
	size?: Size
	displayNames: string[][]
}

const DEFAULT_AVATAR = "46c7bc61-b9dd-4c25-b164-fd6252236603"

export class Avatars extends React.Component<AvatarsProps> {
	public render() {
		const { size = Size.large, displayNames } = this.props
		const uri = displayNames.reduce((acc, elem) => [...acc, elem[0]], [])

		if (uri.length > 4) {
			uri[3] = DEFAULT_AVATAR
			uri.length = 4
		}

		if (uri.length === 1) return <Avatar size={Size.large} id={uri[0]} />
		else {
			return (
				<Container>
					{uri.map((elem, idx) => <Avatar size={size} key={idx} index={idx} count={uri.length} id={elem} />)}
				</Container>
			)
		}
	}
}
