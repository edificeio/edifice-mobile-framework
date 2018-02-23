import style from "glamorous-native"
import * as React from "react";
import RNFetchBlob from "react-native-fetch-blob";
import { View } from "react-native"
import { layoutSize } from "..";
import { Conf } from "../../Conf";

const avatarsMap = {
	awaiters: [],
	onload: function (cb: (userId: string) => void) {
		this.awaiters.push(cb);
	},
	trigger: function (userId: string) {
		this.awaiters.forEach(a => a(userId));
	}
} as any;

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
		borderRadius: 16,
		height: 29,
		marginRight: -6,
		marginLeft: -6,
		width: 29,
	},
	({ index }) => ({
		zIndex: 100 - index,
	})
)

const VeryLargeImage = style.image(
	{
		...StyledImage,
		alignSelf: "center",
		borderRadius: 35,
		height: 71,
		width: 71,
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
	decorate: boolean;
	count: number;
	noAvatar: boolean;

	constructor(props) {
		super(props);

		this.decorate = true
		if (this.props.decorate !== undefined) {
			this.decorate = this.props.decorate
		}

		this.state = { loaded: false }
	}

	componentDidMount(){
		//render avatars after content
		setTimeout(() => this.load(), 10);
	}

	get isGroup(){
		return this.props.id.length < 36;
	}

	async load() {
		if(!this.props.id){
			this.noAvatar = true;
			this.setState({ loaded: true });
			return;
		}
		
		if(this.isGroup){
			this.setState({ loaded: true });
			return;
		}

		if(avatarsMap[this.props.id]){
			if(avatarsMap[this.props.id].loading){
				avatarsMap.onload((userId) => {
					if(userId === this.props.id){
						this.noAvatar = avatarsMap[this.props.id].noAvatar;
						this.setState({ loaded: true });
						return;
					}
				})
			}
			this.noAvatar = avatarsMap[this.props.id].noAvatar;
			this.setState({ loaded: true });
			return;
		}

		avatarsMap[this.props.id] = { loading: true };
		const response = await fetch(`${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=48x48`);
		if((response as any)._bodyInit[0] === '<'){
			this.noAvatar = true;
		}
		avatarsMap[this.props.id] = { noAvatar: this.noAvatar };
		avatarsMap.trigger(this.props.id);
		this.setState({ loaded: true });
	}

	renderNoAvatar(){
		if (this.props.size === Size.large || this.count === 1) {
			return <LargeImage source={require("../../../assets/images/no-avatar.png")} />
		} else if (this.props.size === Size.medium) {
			return <MediumImage source={require("../../../assets/images/no-avatar.png")} />
		} else if (this.props.size === Size.aligned) {
			return <AlignedImage index={this.props.index} source={require("../../../assets/images/no-avatar.png")} />
		} else if (this.props.size === Size.verylarge) {
			return <VeryLargeImage decorate={this.decorate} source={require("../../../assets/images/no-avatar.png")} />
		} else {
			return (
				<SmallImage count={ this.props.count || 1 } index={this.props.index} source={require("../../../assets/images/no-avatar.png")} />
			)
		}
	}

	renderIsGroup(){
		if (this.props.size === Size.large || this.count === 1) {
			return <LargeImage source={require("../../../assets/images/group-avatar.png")} />
		} else if (this.props.size === Size.medium) {
			return <MediumImage source={require("../../../assets/images/group-avatar.png")} />
		} else if (this.props.size === Size.aligned) {
			return <AlignedImage index={this.props.index} source={require("../../../assets/images/group-avatar.png")} />
		} else if (this.props.size === Size.verylarge) {
			return <VeryLargeImage decorate={this.decorate} source={require("../../../assets/images/group-avatar.png")} />
		} else {
			return (
				<SmallImage count={ this.props.count || 1 } index={this.props.index} source={require("../../../assets/images/group-avatar.png")} />
			)
		}
	}

	render() {
		if (!this.state.loaded) {
			return <View />
		}

		if(this.isGroup){
			return this.renderIsGroup();
		}
		if (this.noAvatar) {
			return this.renderNoAvatar();
		}
		if (this.props.size === Size.large || this.count === 1) {
			return <LargeImage source={{ uri: `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=100x100` }} />
		} else if (this.props.size === Size.medium) {
			return <MediumImage source={{ uri:`${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=100x100` }} />
		} else if (this.props.size === Size.aligned) {
			return <AlignedImage index={this.props.index} source={{ uri: `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=100x100` }} />
		} else if (this.props.size === Size.verylarge) {
			return <VeryLargeImage decorate={this.decorate} source={{ uri: `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=150x150` }} />
		} else {
			return (
				<SmallImage
					count={ this.props.count || 1 }
					index={this.props.index}
					source={{ uri: `${Conf.platform}/userbook/avatar/${this.props.id}?thumbnail=100x100` }}
				/>
			)
		}
	}
}
