import * as React from "react"
import { CenterPanel, ContainerFooterBar, TouchableBarPanel } from "../ui/ContainerBar"
import { layoutSize } from "../../constants/layoutSize"
import { Icon, IconOnOff } from ".."

export interface IThreadsBarProps {}

export class ThreadsFooterBar extends React.PureComponent<IThreadsBarProps, {}> {
	public render() {
		return (
			<ContainerFooterBar>
				<TouchableBarPanel>
					<IconOnOff name={"keyboard"} />
				</TouchableBarPanel>
				<TouchableBarPanel>
					<IconOnOff name={"camera"} />
				</TouchableBarPanel>
				<TouchableBarPanel>
					<Icon size={layoutSize.LAYOUT_22} name={"more"} />
				</TouchableBarPanel>
				<CenterPanel />
			</ContainerFooterBar>
		)
	}
}
