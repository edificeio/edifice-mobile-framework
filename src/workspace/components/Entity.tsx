import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {IEventProps, IEntity} from "../types/entity";
import {Bold} from "../../ui/Typography";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import {Text, TextBold} from "../../ui/text";
import { CenterPanel, Content, LeftPanel } from "../../ui/ContainerContent";
import {layoutSize} from "../../styles/common/layoutSize";
import {DateView} from "../../ui/DateView";
import style from "../../styles"


export const Entity = ({date, id, isFolder, name, number, onPress, ownerName}: IEntity & IEventProps) => {
    return (
        <TouchableOpacity style={style.item_flexrow} onPress={() => onPress(id)}>
            <LeftPanel>
                <Icon color={isFolder ? CommonStyles.grey : undefined} size={layoutSize.LAYOUT_40} name={isFolder ? "folder1" : "file-pdf"} />
            </LeftPanel>
            <CenterPanel>
                <View style={style.LeftTopPosition} >
                    <Text numberOfLines={1} style={style.textHeader}>{name}</Text>
                </View>
                <View style={style.LeftBottomPosition} >
                    <DateView date={date} min />
                </View>
                <View style={style.RightBottomPosition} >
                    <Text style={style.textMin}>{isFolder ? `${number} elements` : ownerName}</Text>
                </View>
            </CenterPanel>
        </TouchableOpacity>
    )
}

