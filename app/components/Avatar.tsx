import * as React from "react"
import { Image, StyleSheet, View } from "react-native"
import RNFetchBlob from "react-native-fetch-blob"
import { Conf } from "../Conf"

const style = StyleSheet.create({
	avatar: {
		marginLeft: 15,
		marginRight: 15,
		borderRadius: 25,
		width: 30,
		height: 30,
		borderWidth: 1,
		borderColor: "white",
	},
})

export class Avatar extends React.Component<{ userId: string }, { loaded: boolean }> {
	public base64Str: string

	constructor(props) {
		super(props)
		this.state = { loaded: false }
		this.load()
	}

	public async load() {
		const response = await RNFetchBlob.fetch(
			"GET",
			`${Conf.platform}/userbook/avatar/${this.props.userId}?thumbnail=48x48`
		)
		this.base64Str = response.base64()
		this.setState({ loaded: true })
	}

	public render() {
		if (!this.state.loaded) {
			return <View />
		}
		return <Image source={{ uri: "data:image/jpeg;base64," + this.base64Str }} style={style.avatar} />
	}
}
