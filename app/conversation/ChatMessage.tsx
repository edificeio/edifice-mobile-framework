import style from "glamorous-native"
import * as React from "react"
import { ViewStyle, Text, View, TouchableOpacity } from 'react-native';
import { adaptator } from "../infra/HTMLAdaptator"
import { IThreadModel, MessageStatus, Message } from '../model/conversation';
import { CommonStyles } from "../styles/common/styles"
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { SingleAvatar } from "../ui/avatars/SingleAvatar";
import { Me } from "../infra/Me";
import { ErrorMessage } from '../ui/Typography';
import I18n from "react-native-i18n"
import FitImage from "react-native-fit-image";
import { Col } from "../ui";
import { Carousel } from "../ui/Carousel";

const Item = style.view({
	alignItems: "center",
	backgroundColor: CommonStyles.lightGrey,
	flexDirection: "row",
	justifyContent: "center",
	paddingHorizontal: 16,
	paddingVertical: 12,
});

const ImageMessage = style.image({
	width: 200, 
	height: 130,
	borderBottomLeftRadius: 15,
	borderTopLeftRadius: 15,
	borderTopRightRadius: 15,
	marginBottom: 10,
	shadowColor: CommonStyles.shadowColor,
	shadowOpacity: CommonStyles.shadowOpacity,
	shadowOffset: CommonStyles.shadowOffset,
	shadowRadius: CommonStyles.shadowRadius
}, ({ isMine }): ViewStyle => ({
	borderBottomRightRadius: isMine ? 0 : 15,
	elevation: isMine ? 0 : 3,
}));

const TextBubble = ({ content, isMine }) => <BubbleStyle my={ isMine }>
		<Content my={ isMine }>{ content }</Content>
	</BubbleStyle>;

export class ChatMessage extends React.Component<{ 
	body: string, 
	date: any, 
	displayNames: any[], 
	from: string, 
	status: MessageStatus 
}, { fullscreen: boolean, currentImage: number }> {

	state = {
		fullscreen: false,
		currentImage: 0
	}

	render(){
		const { body, date, displayNames = [], from = "", status } = this.props;

		const my = from === Me.session.userId;
		const messageText = adaptator(body).toText();
		const images = adaptator(body).toImagesArray();

		if (!body) {
			return <style.View />
		}

		return (
			<MessageBlock my={ my }>
				{displayNames.length > 2 &&
					!my && (
					<LeftPanel>
						<SingleAvatar userId={from} />
					</LeftPanel>
				)}
				<Carousel 
					startIndex={ this.state.currentImage }
					visible={ this.state.fullscreen } 
					onClose={ () => this.setState({ fullscreen: false }) } 
					images={ images } />
				{ messageText ? <TextBubble content={ messageText } isMine={ my } /> : <View /> }
				{ images.map((el, i) => <TouchableOpacity key={ i } onPress={ () => this.setState({ fullscreen: true, currentImage: i })}>
						<ImageMessage source={ el } isMine={ my } />
					</TouchableOpacity>
				)}
				{ (status === undefined || status === MessageStatus.sent) && <DateView date={date} /> }
				{ status === MessageStatus.sending && <Text>{tr.Sending_msg}</Text> }
				{ status === MessageStatus.failed && <Text style={{ color: CommonStyles.error, fontSize: 12 }}>{ I18n.t('conversation-failedSent') }</Text> }
			</MessageBlock>
		)
	}
}

const LeftPanel = style.view({
	height: 50,
	width: 50,
})

const MessageBlock = style.view(
	{
		flex: 1,
		padding: 15
	},
	({ my }): ViewStyle => ({
		alignItems: my ? "flex-end" : "flex-start",
		marginLeft: my ? 54 : 5,
		marginRight: my ? 0 : 54,
	})
)

const BubbleStyle = style.view({
		borderBottomLeftRadius: 15,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		justifyContent: "center",
		marginBottom: 10,
		padding: 20,
		shadowColor: CommonStyles.shadowColor,
		shadowOpacity: CommonStyles.shadowOpacity,
		shadowOffset: CommonStyles.shadowOffset,
		shadowRadius: CommonStyles.shadowRadius,
		maxWidth: 200
	},
	({ my }): ViewStyle => ({
		backgroundColor: my ? CommonStyles.iconColorOn : "white",
		borderBottomRightRadius: my ? 0 : 15,
		elevation: my ? 0 : 3,
	})
)

const Content = style.text(
	{
		color: CommonStyles.iconColorOff,
		fontFamily: CommonStyles.primaryFontFamily,
		fontSize: 14,
	},
	({ my }) => ({
		color: my ? "white" : CommonStyles.textColor,
	})
)
