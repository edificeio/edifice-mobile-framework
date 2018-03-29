import style from "glamorous-native"
import * as React from "react";
import { TextStyle, View } from "react-native";
import { CommonStyles } from "../../styles/common/styles";
import { Me } from "../../infra/Me";
import { Header, CenterPanel, Title, TouchableEndBarPanel } from "../../ui/headers/Header";
import { Line } from "../../ui";
import { Back } from "../../ui/headers/Back";
import { RowAvatars } from "../../ui/avatars/RowAvatars";
import { Size } from "../../ui/avatars/Avatar";
import { connect } from "react-redux";
import { setHeader } from "../../actions/ui";
import { Thread } from "../interfaces";

const legendStyle: TextStyle = {
	alignSelf: "center",
	color: "white",
	flexWrap: "nowrap",
}

const Legend14 = style.text({
	...legendStyle,
	fontFamily: CommonStyles.primaryFontFamilyBold,
	height: 45,
	width: '66%',
	textAlign: 'center',
	textAlignVertical: 'center',
	marginBottom: 30
})

const Legend12 = style.text({
	...legendStyle,
	fontFamily: CommonStyles.primaryFontFamilyLight,
	height: 18,
	fontSize: 11,
	marginBottom: 25
})

export const ContainerAvatars = style.view({
	alignItems: "center",
	height:160,
	justifyContent: "flex-start",
	flex: 1
})

export interface IThreadsBarProps {
	navigation?: any;
	conversation: Thread;
	setHeader: (number) => void
}

export class ThreadsTopBar extends React.PureComponent<IThreadsBarProps, {}> {
	public state = {
		expand: false,
		slideIndex: 0,
	}

	static expanded;

	public setHeaderHeight(){
		if(this.state.expand){
			this.props.setHeader(220);
		}
		else{
			this.props.setHeader(56);
		}
	}

	private onPress() {
		ThreadsTopBar.expanded = !this.state.expand;
		this.setState({ expand: !this.state.expand })
	}

	private onSlideIndex(slideIndex) {
		this.setState({ slideIndex })
	}

	public render() {
		const { navigation } = this.props
		const { displayNames, subject, to } = this.props.conversation;
		const { expand } = this.state
		const images = to.reduce(
			(acc, elem) => (Me.session.userId === to[0] && to.length !== 1 ? acc : [...acc, elem]),
			[]
		);
		const names = displayNames.reduce(
			(acc, elem) => (Me.session.userId === elem[0] && displayNames.length !== 1 ? acc : [...acc, elem[1]]),
			[]
		)

		return (
			<Header onLayout={ () => this.setHeaderHeight() }>
				<View style={{ flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
					<Line>
						<Back navigation={ navigation } />
						<CenterPanel onPress={() => this.onPress()} style={{ paddingTop: 5, paddingBottom: 5 }}>
							{!expand && <RowAvatars images={images} size={Size.small } />}
							<Title numberOfLines={ 1 } smallSize={!expand}>{subject}</Title>
						</CenterPanel>
						<TouchableEndBarPanel />
					</Line>
					<Line>
						{expand ? (
							<ContainerAvatars>
								<RowAvatars onSlideIndex={slideIndex => this.onSlideIndex(slideIndex)} images={images} />
								<Legend14 numberOfLines={2}>{names[this.state.slideIndex]}</Legend14>
							</ContainerAvatars>
						) : <View />}
					</Line>
				</View>
			</Header>
		)
	}
}

export default connect(
	(state: any, props: any) => ({
		conversation: state.conversation.threads.find(t => t.thread_id === state.conversation.currentThread)
	}), 
	dispatch => ({
		setHeader: (height: number) => setHeader(dispatch)(height)
	})
)(ThreadsTopBar)
