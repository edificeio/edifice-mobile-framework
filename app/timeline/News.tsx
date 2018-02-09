import style from "glamorous-native"
import * as React from "react"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"
import { INewsModel } from "../model/Timeline"
import { CommonStyles } from "../styles/common/styles"
import { Avatar, Size } from "../ui/Avatar"
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { CenterPanel, Content, LeftPanel } from "../ui/ContainerContent"
import {Row} from "../ui";

interface INewsProps extends INewsModel {
	onPress?: (id: string) => void
}

export const News = ({ preview = "", senderId, senderName, resourceName, message, images = [] }: INewsProps) => {
	return (
		<Container>
			<Row>
				<LeftPanel>
					<Avatar id={senderId} size={Size.large} />
				</LeftPanel>
				<CenterPanel>
					<Bold>
						{senderName}
						<Light> {tr.On} </Light>
						{resourceName}
					</Bold>
					<DateView date={364647377383} />
				</CenterPanel>
			</Row>
			{preview.length ? <Content nb={0}>{preview}</Content> : <View />}
			{preview.length && images.length ? <Margin /> : <View />}
			{images.length ? <Image source={{ uri: images[0] }} /> : <View />}
		</Container>
	)
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

export const Container = style.touchableOpacity({
	backgroundColor: CommonStyles.itemBackgroundColor,
	borderBottomColor: CommonStyles.borderBottomItem,
	borderBottomWidth: 1,
	paddingHorizontal: layoutSize.LAYOUT_16,
	paddingVertical: layoutSize.LAYOUT_12,
})
