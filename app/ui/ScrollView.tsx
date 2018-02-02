import * as React from "react"
import { ScrollView as SysScrollView } from "react-native"

export const ScrollView = props => (
	<SysScrollView {...props} keyboardShouldPersistTaps="handled">
		{props.children}
	</SysScrollView>
)
