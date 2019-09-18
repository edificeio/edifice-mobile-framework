import * as React from "react";
import { HeaderIcon } from "./Header";

export const Back = ({ navigation }) => (
	<HeaderIcon onPress={() => navigation.goBack(null)} name={"back"}></HeaderIcon>
)