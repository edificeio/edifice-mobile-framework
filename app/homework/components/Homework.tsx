import * as React from "react";
import { PageContainer, Content } from "../../ui/ContainerContent";
import { ActivityIndicator } from "react-native";
import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";

const { View, Text, FlatList } = style;

interface HomeworkTask {
	title: string;
	description: string;
}
interface HomeworkDay {
	daynb: number;
	dayname: string;
	tasks: HomeworkTask[];
}

const TESTDATA = [
	{
		daynb: 22,
		dayname: "jeudi",
		tasks: [
			{
				title: "Intelligence Artificielle",
				description: "Réviser le Traitement Automatique du Langage Naturel",
			},
			{
				title: "Tristitude",
				description: "Conjuguer Bouillir au subjonctif pluriel",
			},
			{
				title: "Philosophie",
				description: "Dissertation : Quel avenir pour les pingouins d'Afrique ?",
			},
		],
	},
	{
		daynb: 23,
		dayname: "vendredi",
		tasks: [
			{
				title: "Scuplture sur marbre",
				description: "Sculpter la Venus de Milo avec des bras",
			},
			{
				title: "Kamoulox",
				description: "Photocopier du sable et éventer la famille pirate",
			},
		],
	},
	{
		daynb: 26,
		dayname: "lundi",
		tasks: [
			{
				title: "Russe",
				description: "Réciter l'alphabet cyrillique à l'envers",
			},
			{
				title: "Physique - Chimie",
				description: "Exo 15 → 88 p. 249 et plus ou moins",
			},
			{
				title: "Philosophie",
				description: "Dissertation : Quel avenir pour les dissertations sur les pingouins d'Afrique ?",
			},
		],
	},
];

interface HomeworkState {
	data: HomeworkDay[];
	isFetchingNewer: boolean;
	isFetchingOlder: boolean;
	startId: number;
	count: number;
}

/**
 * Homework
 *
 * Display page for all homework in a calendar-like way.
 */

export class Homework extends React.Component<{}, HomeworkState> {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			isFetchingNewer: false,
			isFetchingOlder: false,
			startId: 0,
			count: 0,
		};
	}

	static get NB_DAYS_PER_FETCH() { return 5; }

	public render() {
		return (
			<PageContainer>
				<HomeworkTimeLine />
				<FlatList
					data={this.state.data}
					renderItem={({ item }) => <HomeworkDayTasks data={item} />}
					ListHeaderComponent={() => <View height={15} />}
					onEndReached={() => this._onEndReached()}
					onEndReachedThreshold={0.5}
					ListFooterComponent={() => (this.state.isFetchingNewer ? <ActivityIndicator animating={true} /> : null)}
				/>
			</PageContainer>
		);
	}

	private _renderItem(item) {
		// TODO: switch display or loading
	}

	private async _onEndReached() {
		this.fetchNewer();
	}

	private _onFetchError(info: string) {
		console.warn("Can't show tasks : " + info);
	}

	componentDidMount() {
		console.warn("first fetch...");
		this.fetchNewer();
	}

	private async _fetchTasks(start: number, count: number) {
		function timeout(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		try {
			await timeout(2000); // sleep for 2 seconds.
			return TESTDATA;
		} catch (err) {
			throw true;
		}
	}

	public async fetchNewer() {
		this.setState({ isFetchingNewer: true });
		try {
			let tasks = await this._fetchTasks(this.state.startId + this.state.count, Homework.NB_DAYS_PER_FETCH);
			console.warn("OK NEWER");
			this.setState((prevState, props) => ({
				data: prevState.data.concat(tasks),
				// TODO: set the startID and the count from API result
			}));
		} catch (err) {
			this._onFetchError("error loading newer tasks");
		}
	}

	public async fetchOlder() {
		this.setState({ isFetchingOlder: true });
		try {
			let tasks = await this._fetchTasks(this.state.startId - Homework.NB_DAYS_PER_FETCH, Homework.NB_DAYS_PER_FETCH);
			console.warn("OK OLDER");
			this.setState((prevState, props) => ({
				data: tasks.concat(prevState.data),
				// TODO: set the startID and the count from API result
			}));
		} catch (err) {
			this._onFetchError("error loading newer tasks");
		}
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
 * HomeworkDayCheckpoint
 *
 * Just a wrapper for the heading of a day tasks. Displays a day number in a circle and a day name
 * TODO?: May took a Date object as a parameter instead of a number and a string ?
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number`- Day number to be displayed in a `HomeworkDayCircleNumber`.
 *     `text`: `string` - Day name to be displayed.
 *     `active`: `boolean` - An active `HomeworkDayCheckpoint` will be highlighted. Default `false`.
 *
 * An unstyled version on this component is available as `HomeworkDayCheckpoint_Unstyled`.
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
		<HomeworkDayCircleNumber nb={nb} active={active} />
		<Text color={CommonStyles.lightTextColor} fontSize={12}>
			{text.toUpperCase()}
		</Text>
	</View>
);

const HomeworkDayCheckpoint = style(HomeworkDayCheckpoint_Unstyled)({
	flexDirection: "row",
	alignItems: "center",
});

/**
 * HomeworkDayCircleNumber
 *
 * Display a number in a circle elegantly. Mostly used to show a day number.
 * Props:
 *     `style`: `any` - Glamorous style to add.
 * 	   `nb`: `number` - Just as simple as the number to be displayed.
 *     `active`: `boolean` - An active `HomeworkDayCircleNumber` will be highlighted.
 * FIXME: style.Text component gives Invariant Violation, must use `const {Text} = style`. Why ?
 * TODO: When active, the blue background should be a gradient, according to the mockup.
 *
 * An unstyled version on this component is available as `HomeworkDayCircleNumber_Unstyled`.
 */
const HomeworkDayCircleNumber_Unstyled = ({
	style,
	nb,
	active = false,
}: {
	style?: any;
	nb?: number;
	active?: boolean
}) => (
	<View style={[style]}>
		<Text color={active ? CommonStyles.tabBottomColor : CommonStyles.lightTextColor} fontSize={12}>
			{nb}
		</Text>
	</View>
);

const HomeworkDayCircleNumber = style(HomeworkDayCircleNumber_Unstyled)(
	{
		alignItems: "center",
		justifyContent: "center",
		width: 30,
		height: 30,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: CommonStyles.tabBottomColor,
		shadowColor: "#6B7C93",
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		borderRadius: 15,
		marginHorizontal: 14,
	},
	({ active }) => ({
		backgroundColor: active ? CommonStyles.actionColor : CommonStyles.tabBottomColor
	})
);

/**
 * HomeworkCard
 *
 * Like `Card`, but some margin and padding, custom shadow and rounded.
 *
 * An unstyled version on this component is available as `HomeworkCard_Unstyled`.
 */

const HomeworkCard_Unstyled = ({
	style,
	title,
	description,
}: {
	style?: any;
	title?: string;
	description?: string
}) => (
	<View style={[style]}>
		<Text fontSize={14} color={CommonStyles.textColor} lineHeight={20}>
			{description}
		</Text>
		<Text fontSize={12} color={CommonStyles.lightTextColor} marginTop={5}>
			{title}
		</Text>
	</View>
);

const HomeworkCard = style(HomeworkCard_Unstyled)({
	marginBottom: 15,
	marginLeft: 60,
	marginRight: 20,
	borderRadius: 5,
	shadowColor: "#6B7C93",
	shadowOpacity: 0.2,
	shadowOffset: { width: 0, height: 2 },
	paddingVertical: 20,
	paddingHorizontal: 15,
	backgroundColor: "#FFF",
});

/**
 * HomeworkDayTasks
 *
 * Display the task list of a day (with day number and name).
 * Props:
 *     data: HomeworkDay - information of the day (number and name) and list of the tasks.
 * TODO: Detect if the day is today, and set the HomeworkDayCheckpoint active in this case.
 */
interface HomeworkDayTasksProps {
	data: HomeworkDay;
}
class HomeworkDayTasks extends React.Component<HomeworkDayTasksProps, any> {
	constructor(props: HomeworkDayTasksProps) {
		super(props);
	}

	public render() {
		return (
			<View>
				<HomeworkDayCheckpoint nb={this.props.data.daynb} text={this.props.data.dayname} />
				{this.props.data.tasks.map(item => <HomeworkCard title={item.title} description={item.description} />)}
			</View>
		);
	}
};