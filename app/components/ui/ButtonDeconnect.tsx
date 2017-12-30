import * as React from "react"
import {StyleSheet, Text, TouchableOpacity, View} from "react-native"
import {layoutSize} from "../../constants/layoutSize";


const styles = StyleSheet.create({
	container: {
		alignItems: "flex-end",
		backgroundColor: "white",
		flex: 0,
		flexDirection: "row",
		justifyContent: "flex-start",
        height:layoutSize.LAYOUT_30,
		marginTop:layoutSize.LAYOUT_20,
        paddingBottom: layoutSize.LAYOUT_7,
		paddingHorizontal: layoutSize.LAYOUT_13,
	},
    text: {
        color: "red",
        fontSize: layoutSize.LAYOUT_10,
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
