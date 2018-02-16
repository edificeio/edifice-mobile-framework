import style from "glamorous-native"
import * as React from "react"
import { Conf } from "../Conf"
import RNFetchBlob from "react-native-fetch-blob"
import { layoutSize } from "../constants/layoutSize"
import { View } from "react-native"

export enum Size {
	aligned,
	large,
	medium,
	small,
	verylarge,
}
const StyledImage = {
	borderColor: "white",
	borderWidth: layoutSize.LAYOUT_1,
	margin: layoutSize.LAYOUT_2,
}

const LargeImage = style.image({
	...StyledImage,
	borderRadius: layoutSize.LAYOUT_24,
	height: layoutSize.LAYOUT_45,
	width: layoutSize.LAYOUT_45,
})

const MediumImage = style.image({
	...StyledImage,
	borderRadius: layoutSize.LAYOUT_16,
	height: layoutSize.LAYOUT_35,
	width: layoutSize.LAYOUT_35,
})

const AlignedImage = style.image(
	{
		...StyledImage,
		borderRadius: layoutSize.LAYOUT_16,
		height: layoutSize.LAYOUT_29,
		marginLeft: layoutSize.LAYOUT_MOINS_12,
		width: layoutSize.LAYOUT_29,
	},
	({ index }) => ({
		zIndex: 100 - index,
	})
)

const VeryLargeImage = style.image(
	{
		...StyledImage,
		alignSelf: "center",
		borderRadius: layoutSize.LAYOUT_35,
		height: layoutSize.LAYOUT_71,
		width: layoutSize.LAYOUT_71,
		margin: 0,
	},
	({ decorate }) => ({
		borderWidth: decorate ? layoutSize.LAYOUT_1 : layoutSize.LAYOUT_0,
	})
)

const SmallImage = style.image(
	{
		borderColor: "white",
		borderWidth: layoutSize.LAYOUT_1,
		position: "absolute",
	},
	({ count, index }) => ({
		borderRadius: count === 1 ? layoutSize.LAYOUT_22 : count === 2 ? layoutSize.LAYOUT_15 : layoutSize.LAYOUT_10,
		height: count === 1 ? layoutSize.LAYOUT_45 : count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
		left:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index === 0 || (index === 2 && count === 4)
					? layoutSize.LAYOUT_0
					: index === 2 ? layoutSize.LAYOUT_14 : layoutSize.LAYOUT_25,
		top:
			count === 2
				? index === 0 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_15
				: index < 2 ? layoutSize.LAYOUT_0 : layoutSize.LAYOUT_25,
		width: count === 1 ? layoutSize.LAYOUT_45 : count === 2 ? layoutSize.LAYOUT_31 : layoutSize.LAYOUT_22,
	})
)

export interface IAvatarProps {
	count?: number
	decorate?: boolean
	id: string
	index?: number
	large?: boolean
	size: Size
}

export class Avatar extends React.Component<IAvatarProps, { loaded: boolean }> {
	base64Str: string
	decorate: boolean
	count: number
	noAvatar: boolean
	isGroup: boolean
	uri: string

	constructor(props) {
		super(props)

		this.decorate = true
		if (this.props.decorate !== undefined) {
			this.decorate = this.props.decorate
		}
		this.count = 1
		if (this.props.count !== undefined) {
			this.count = this.props.count
		}

		this.state = { loaded: false }
		this.load()
	}

	async load() {
		const response = await RNFetchBlob.fetch("GET", `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=48x48`)
		this.base64Str = response.base64()

		if (this.base64Str.length === 1008) {
			this.noAvatar = true
		} else {
			this.uri = "data:image/jpeg;base64," + this.base64Str
		}
		this.setState({ loaded: true })
	}

	render() {
		if (!this.state.loaded) {
			return <View />
		}

		if (this.noAvatar) {
			console.log("has no avatar")
			if (this.props.size === Size.large || this.count === 1) {
				return <LargeImage source={require("../../assets/images/no-avatar.png")} />
			} else if (this.props.size === Size.medium) {
				return <MediumImage source={require("../../assets/images/no-avatar.png")} />
			} else if (this.props.size === Size.aligned) {
				return <AlignedImage index={this.props.index} source={require("../../assets/images/no-avatar.png")} />
			} else if (this.props.size === Size.verylarge) {
				return <VeryLargeImage decorate={this.decorate} source={require("../../assets/images/no-avatar.png")} />
			} else {
				return (
					<SmallImage count={this.count} index={this.props.index} source={require("../../assets/images/no-avatar.png")} />
				)
			}
		}
		if (this.props.size === Size.large || this.count === 1) {
			return <LargeImage source={{ uri: this.uri }} />
		} else if (this.props.size === Size.medium) {
			return <MediumImage source={{ uri: "data:image/jpeg;base64," + this.base64Str }} />
		} else if (this.props.size === Size.aligned) {
			return <AlignedImage index={this.props.index} source={{ uri: "data:image/jpeg;base64," + this.base64Str }} />
		} else if (this.props.size === Size.verylarge) {
			return <VeryLargeImage decorate={this.decorate} source={{ uri: "data:image/jpeg;base64," + this.base64Str }} />
		} else {
			return (
				<SmallImage
					count={this.count}
					index={this.props.index}
					source={{ uri: "data:image/jpeg;base64," + this.base64Str }}
				/>
			)
		}
	}
}
