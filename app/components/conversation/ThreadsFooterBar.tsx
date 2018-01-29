import style from "glamorous-native"
import * as React from "react"
import { ContainerFooterBar } from "../ui/ContainerBar"
import { layoutSize } from "../../constants/layoutSize"
import { IconOnOff } from ".."

export interface IThreadsBarProps {
	navigation?: any
}

export class ThreadsFooterBar extends React.PureComponent<IThreadsBarProps, {}> {
	public render() {
		return (
			<ContainerFooterBar>
				<IconOnOff size={layoutSize.LAYOUT_24} name={"keyboard"} />
				<IconOnOff size={layoutSize.LAYOUT_24} name={"camera"} />
				<IconOnOff size={layoutSize.LAYOUT_24} name={"more"} />
			</ContainerFooterBar>
		)
	}
}
