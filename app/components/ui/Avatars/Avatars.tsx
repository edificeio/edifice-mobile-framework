import style from "glamorous-native"
import * as React from "react"
import { Avatar } from "./Avatar"

const Container = style.view({
	flex: 1,
})

export interface AvatarsProps {
	displayNames: string[][]
}

const DEFAULT_AVATAR = "46c7bc61-b9dd-4c25-b164-fd6252236603"

export class Avatars extends React.Component<AvatarsProps> {
	public render() {
		const uri = this.props.displayNames.reduce((acc, elem) => [...acc, elem[0]], [])

		if (uri.length > 4) {
			uri[3] = DEFAULT_AVATAR
			uri.length = 4
		}

		if (uri.length === 1) {
			return <Avatar large={true} id={uri[0]} />
		} else {
			return <Container>{uri.map((elem, idx) => <Avatar key={idx} index={idx} count={uri.length} id={elem} />)}</Container>
		}
	}
}
