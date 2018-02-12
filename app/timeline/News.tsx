import style from "glamorous-native"
import * as React from "react"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { INewsModel } from "../model/Timeline"
import { CommonStyles } from "../styles/common/styles"
import { Avatar, Size } from "../ui/Avatar"
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import {CenterPanel, Content, Header, Item, LeftPanel} from "../ui/ContainerContent"
import { Row } from "../ui"

interface INewsProps extends INewsModel {
	onPress?: (id: string, index: number, full: boolean) => void
	index: number
}

interface INewsState {
	full?: boolean
}

export class News extends React.PureComponent<INewsProps, INewsState> {
	state = {
		full: false,
	}

	onPress() {
		const { full } = this.state
		this.setState({ full: !full })

		this.props.onPress(this.props.id, this.props.index, !full)
	}

	render() {
		console.log("Render News")
		const { full } = this.state
		const { date, preview = "", senderId, senderName, resourceName, message, images = [] } = this.props
		return (
			<Item full={full} onPress={() => this.onPress()}>
				<Header>
					<LeftPanel>
						<Avatar id={senderId} size={Size.large} />
					</LeftPanel>
					<CenterPanel>
						<Bold>
							{senderName}
							<Light> {tr.On} </Light>
							{resourceName}
						</Bold>
						<DateView date={date} short={false} />
					</CenterPanel>
				</Header>
				{preview.length ? <Content nb={0}>{this.state.full ? message : preview}</Content> : <View />}
				{preview.length && !full && images.length ? <Margin /> : <View />}
				{images.length ? (
					full ? (
						images.map(item => <Image source={{ uri: item }} />)
					) : (
						<Image source={{ uri: images[0] }} />
					)
				) : (
					<View />
				)}
			</Item>
		)
	}
}

const Bold = style.text({
	color: CommonStyles.textColor,
	fontSize: layoutSize.LAYOUT_14,
	fontFamily: CommonStyles.primaryFontFamily,
	fontWeight: "600",
})

const Light = style.text({
	color: CommonStyles.textColor,
	fontSize: layoutSize.LAYOUT_12,
	fontFamily: CommonStyles.primaryFontFamilyLight,
	fontWeight: "400",
})

const Margin = style.view({
	height: layoutSize.LAYOUT_10,
})

const Image = style.image({
	marginTop: layoutSize.LAYOUT_10,
	height: layoutSize.LAYOUT_160,
	width: layoutSize.LAYOUT_350,
})
