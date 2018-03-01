import * as React from "react";
import { HeaderIcon } from './Header';
import { Icon } from "..";

export const Close = ({ onClose }) => (
	<HeaderIcon onPress={() => onClose()}>
        <Icon size={ 22 } name={"close"} color={"white"} />
    </HeaderIcon>
)