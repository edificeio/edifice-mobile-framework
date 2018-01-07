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

export class Avatar extends React.Component<{ userId: string }, { base64Str: string }> {
	state = { base64Str: ""}

	async fetch() {
        const response = await RNFetchBlob.fetch(
            "GET",
            `${Conf.platform}/userbook/avatar/${this.props.userId}?thumbnail=48x48`
        )
        this.setState( {base64Str: response.base64()})
	}

	public async componentDidMount() {
		this.fetch()
	}

	public render() {
		if (this.state.base64Str.length === 0) {
			return <View />
		}
		return <Image source={{ uri: "data:image/jpeg;base64," + this.state.base64Str }} style={style.avatar} />
	}
}
