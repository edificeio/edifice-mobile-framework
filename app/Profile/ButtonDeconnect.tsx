import styled from "glamorous-native"
import * as React from "react";
import { RowProperties } from "../ui/index";
import {tr} from "../i18n/t";
import { Row } from "../ui/Grid";

const Container = (props: RowProperties) => (
	<Row
		alignItems="center"
		backgroundColor="white"
		borderBottomColor="#dddddd"
		borderBottomWidth={1}
		height={46}
		justifyContent="flex-start"
		marginTop={20}
		paddingHorizontal={13}
		{...props}
	/>
)

const Deconnect = styled.text({
	color: "#F64D68",
	fontSize: 14,
})

export interface ButtonTextProps {
	onPress: () => any
}

export const ButtonDeconnect = ({ onPress }: ButtonTextProps) => (
	<Container onPress={() => onPress()}>
		<Deconnect>{tr.Disconnect}</Deconnect>
	</Container>
)
