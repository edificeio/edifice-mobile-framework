

import * as React from "react"
import { View, Text } from "react-native";
import { ContainerTopBar, Title, SubTitle, TouchableBarPanel } from '../ContainerBar';
import { Icon } from "..";

export const Back = ({ navigation }) => (
	<TouchableBarPanel onPress={() => navigation.goBack()}>
        <Icon size={ 22 } name={"back"} color={"white"} />
    </TouchableBarPanel>
)