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
 * Just a wrapper for the heading of a day tasks.
 */

const HomeworkDayCheckpoint_Unstyled = ({
	style,
	nb,
	text = "",
	active = false,
}: {
	style?: any;
	nb?: number;
	text?: string;
	active?: boolean
}) => (
	<View style={[style]}>
		{active ? <HomeworkDayCircleNumberActive nb={nb} /> : <HomeworkDayCircleNumber nb={nb} />}
		<Text>{text.toUpperCase()}</Text>
	</View>
);
const HomeworkDayCheckpoint = style(HomeworkDayCheckpoint_Unstyled)({
	flexDirection: "row",
	alignItems: "center",
});

// TODO: Use just one class with an `active` prop, and manage text color
const HomeworkDayCircleNumber_Unstyled = ({ style, nb }: { style?: any; nb?: number }) => (
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
const HomeworkDayCircleNumberActive = style(HomeworkDayCircleNumber)({
	backgroundColor: CommonStyles.actionColor,
	color: CommonStyles.tabBottomColor,
});


/**
 * All the tasks of one day, with day number displayed.
 */
class HomeworkDayTasks extends React.Component {
	public render() {
		return (
			<View>
				<HomeworkDayCheckpoint nb={19} text="jeudi" active/>
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