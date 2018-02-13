import style from "glamorous-native"
import * as React from "react"
import { FlatList } from "react-native"
import { IThreadModel } from "../model/Thread"
import styles from "../styles/index"
import { Thread } from "./Thread"
import { sameDay } from "../utils/date"
import { Row } from "../ui"
import { tr } from "../i18n/t"
import { View } from "react-native"
import { layoutSize } from "../constants/layoutSize"

export interface IThreadsProps {
	dispatch?: (any) => void
	navigation?: any
	readNextThreads?: (string) => any
	readPrevThreads?: (string) => any
	synced: boolean
	threads: IThreadModel[]
	userId: string
}

export class Threads extends React.Component<IThreadsProps, any> {
	public alreadyDisplayTodayDate: boolean = false
	list: any

	componentWillMount() {
		const { conversationId } = this.props.navigation.state.params
		if (this.props.synced) {
			this.props.readNextThreads(conversationId)
			this.props.readPrevThreads(conversationId)
		}
	}

	public render() {
		const { threads } = this.props

		return (
			<FlatList
				data={threads}
				keyExtractor={item => item.id}
				renderItem={({ item }) => this.renderItem(item)}
				style={styles.grid}
				ref={ref => (this.list = ref)}
				onContentSizeChange={() => this.list.scrollToEnd({ animated: true })}
				onLayout={() => this.list.scrollToEnd({ animated: true })}
			/>
		)
	}

	private showTodayDate(item) {
		if (this.alreadyDisplayTodayDate) return false

		if (sameDay(item)) {
			this.alreadyDisplayTodayDate = true
			return true
		}
		return false
	}

	private displayTodayDate() {
		return (
			<Row>
				<Border />
				<Text>{tr.today}</Text>
				<Border />
			</Row>
		)
	}

	private renderItem(item: IThreadModel) {
		if (!this.props.userId) {
			return <View />
		}

		return (
			<View>
				{this.showTodayDate(item) && this.displayTodayDate()}
				<Thread {...item} userId={this.props.userId} />
			</View>
		)
	}
}

const Border = style.view({
	backgroundColor: "#DCDDE0",
	flex: 1,
	height: 1,
	marginHorizontal: layoutSize.LAYOUT_10,
})

const Text = style.text({
	alignSelf: "center",
	color: "#FF858FA9",
})
