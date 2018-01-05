import * as React from "react"
import {StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {layoutSize} from "../../constants/layoutSize";
import {Row} from "./Row";


const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		backgroundColor: "white",
		borderBottomColor: "#dddddd",
		borderBottomWidth: 1,
		flex: 0,
		flexDirection: "row",
		height: layoutSize.LAYOUT_46,
		justifyContent: "flex-start",
		marginTop: layoutSize.LAYOUT_20,
		paddingHorizontal: layoutSize.LAYOUT_13,
	},
    text: {
        color: "#F64D68",
    }
})

export interface ButtonTextProps {
	onPress: () => any
}

export const ButtonDeconnect = ({
	onPress,
}: ButtonTextProps) => {
	return (
        <View style={styles.container} >
			<TouchableOpacity onPress={onPress}>
				<Text style={styles.text}>
					Se déconnecter
				</Text>
			</TouchableOpacity>
		</View>
	)
}
