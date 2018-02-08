import style from "glamorous-native"
import * as React from "react"
import { layoutSize } from "../constants/layoutSize"
import { INewsModel } from "../model/News"
import { CommonStyles } from "../styles/common/styles"
import { Avatar, Size } from "../ui/Avatar"
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { CenterPanel, Item, LeftPanel } from "../ui/ContainerContent"
import { Row } from "../ui"

interface IANewsProps extends INewsModel {
	onPress?: (id: string) => void
}

export const ANews = ({ _id, date, onPress = i => i, params = { username: "", blogTitle: ""}, sender }: IANewsProps) => {
	return (
		<Item nb={0} onPress={() => onPress(_id)}>
			<LeftPanel>
				<Avatar id={sender} size={Size.large} />
			</LeftPanel>
			<CenterPanel>
				<Row>
					<Bold>
						{params.username}
						<Light> {tr.On} </Light>
						{params.blogTitle}
					</Bold>
				</Row>
				<DateView date={date["$date"]} />
			</CenterPanel>
		</Item>
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
