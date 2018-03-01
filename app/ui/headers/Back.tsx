import * as React from "react";
import { HeaderIcon } from './Header';
import { Icon } from "..";

export const Back = ({ navigation }) => (
	<HeaderIcon onPress={() => navigation.goBack()}>
        <Icon size={ 22 } name={"back"} color={"white"} />
    </HeaderIcon>
)