import * as React from "react";
import { PageContainer, Content } from "../../ui/ContainerContent";
import { ScrollView, Text, View } from "react-native";
import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";
import { Card } from "../../ui/Card";
import { CircleNumber } from "../../ui/CircleNumber";

/**
 * Page container that show every UI component.
 */
export class Homework extends React.Component {

	public render() {
		return (
			<PageContainer>
				<HomeworkTimeLine/>
				<ScrollView>
					<HomeworkDayTasks/>
					<HomeworkDayTasks/>
				</ScrollView>
			</PageContainer>
		);
	}
};

/**
 * Just display a grey vertical line at the left tall as the screen is.
 */
const HomeworkTimeLine = style.view({
	width: 1,
	height: "100%",
	backgroundColor: CommonStyles.entryfieldBorder, // TODO: Use the linear gradient instead of a plain grey
	position: "absolute",
	left: 29,
});

/**
 * Just a wrapper for the heading of a day tasks. // TODO: wrap the content in a brand new component for this usage.
 */
const HomeworkDayCheckpoint = style.view({
	flexDirection: "row",
});
/*
const HomeworkDayCheckpoint_Unstyled = ({ style, nb, text }) => (
	<View style={[style]}>
		<HomeworkDayCircleNumber nb={nb} />
		<Text>{text.toUpperCase()}</Text>
	</View>
);*/

const HomeworkDayCircleNumber_Unstyled = ({ style, nb }) => (
	<View style={[style]}>
		<Text>{nb}</Text>
	</View>
);
const HomeworkDayCircleNumber = style(HomeworkDayCircleNumber_Unstyled)({
	alignItems: "center",
	justifyContent: "center",
	width: 30,
	height: 30,
	borderStyle: "solid",
	borderWidth: 1,
	borderColor: CommonStyles.tabBottomColor,
	backgroundColor: CommonStyles.tabBottomColor,
	shadowColor: "#6B7C93",
	shadowOpacity: 0.2,
	shadowOffset: { width: 0, height: 2 },
	shadowRadius: 4,
	borderRadius: 15,
	marginHorizontal: 14,
});


/**
 * All the tasks of one day, with day number displayed.
 */
class HomeworkDayTasks extends React.Component {
	public render() {
		return (
			<View>
				<HomeworkDayCheckpoint>
					<HomeworkDayCircleNumber nb={19} />
					<Text>JEUDI</Text>
				</HomeworkDayCheckpoint>
				<Card>
					<Text>Réviser le Traitement Automatique du Langage Naturel</Text>
					<Text>Intelligence Artificielle</Text>
				</Card>
				<Card>
					<Text>Conjuguer Bouillir au subjonctif pluriel</Text>
					<Text>Tristitude</Text>
				</Card>
			</View>
		);
	}
};