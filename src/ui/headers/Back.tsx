import * as React from "react";
import { HeaderIcon } from './Header';
import { Icon } from "..";

export const Back = ({ navigation }) => (
	<HeaderIcon onPress={() => navigation.goBack()} name={ "back" }></HeaderIcon>
)