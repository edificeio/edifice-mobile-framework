import style from "glamorous-native"
import * as React from "react"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { INewsModel } from "../model/Timeline"
import { CommonStyles } from "../styles/common/styles";
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { CenterPanel, Content, Header, LeftPanel, ArticleContainer } from "../ui/ContainerContent"
import { Images } from "../ui/Images"
import { Card } from '../ui/Card';
import { SingleAvatar } from "../ui/avatars/SingleAvatar";

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
			<ArticleContainer>
				<Card onPress={() => this.onPress()}>
					<Header>
						<LeftPanel>
							<SingleAvatar userId={senderId} />
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
					{preview.length ? <Content nb={1}>{this.state.full ? message : preview}</Content> : <View />}
					{images.length ? <Images images={images} /> : <View />}
				</Card>
			</ArticleContainer>
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
	height: layoutSize.LAYOUT_160,
	width: layoutSize.LAYOUT_350,
})
