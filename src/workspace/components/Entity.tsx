import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {IEventProps, IEntity} from "../types/entity";
import {Bold} from "../../ui/Typography";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Text } from "../../ui/text";
import { CenterPanel, Content, LeftPanel } from "../../ui/ContainerContent";
import {layoutSize} from "../../styles/common/layoutSize";

const style = StyleSheet.create({
    containerStyle: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: CommonStyles.borderBottomItem,
        flexDirection: "row",
        borderBottomWidth: 1,
    },
});


export const Entity = ({date, id, isFolder, name, number, onPress, ownerName}: IEntity & IEventProps) => {
    return (
        <TouchableOpacity style={style.containerStyle} onPress={() => onPress(id)}>
            <LeftPanel>
                <Icon size={layoutSize.LAYOUT_40} name={isFolder ? "folder1" : "file-pdf"} />
            </LeftPanel>
            <CenterPanel>
                <Text><Bold>{name}</Bold></Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Content>{date}</Content>
                    <Content>{isFolder ? number : ownerName}</Content>
                </View>
            </CenterPanel>
        </TouchableOpacity>
    )
}

