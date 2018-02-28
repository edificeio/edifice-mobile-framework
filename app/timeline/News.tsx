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
import { TouchCard } from '../ui/Card';
import { SingleAvatar } from "../ui/avatars/SingleAvatar";
import { Light, Bold } from "../ui/Typography";
import { Preview } from "../ui/Preview";

interface INewsProps extends INewsModel {
	onPress?: (expend?: boolean) => void
	index: number
}

interface INewsState {
	full?: boolean
}

export class News extends React.PureComponent<INewsProps, INewsState> {
	state = {
		full: false,
	}

	open(expend: boolean) {
		this.props.onPress(expend);
	}

	render() {
		const { date, senderId, senderName, resourceName, message, images = [] } = this.props
		return (
			<ArticleContainer>
				<TouchCard onPress={() => this.open(false)}>
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
					<Preview textContent={ message } onExpend={ () => this.open(true) } />
					{images.length ? <Images images={images} /> : <View />}
				</TouchCard>
			</ArticleContainer>
		)
	}
}

const Margin = style.view({
	height: layoutSize.LAYOUT_10,
})

const Image = style.image({
	height: layoutSize.LAYOUT_160,
	width: layoutSize.LAYOUT_350,
})
