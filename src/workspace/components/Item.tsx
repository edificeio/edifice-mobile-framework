import * as React from "react"
import { Image, TouchableOpacity, View } from "react-native";
import { IEventProps, IItem, FilterId, EVENT_TYPE } from "../types";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { Text } from "../../ui/text";
import { CenterPanel, LeftIconPanel } from "../../ui/ContainerContent";
import { layoutSize } from "../../styles/common/layoutSize";
import { DateView } from "../../ui/DateView";
import style from "../../styles"
import { filters } from "../types/filters/helpers/filters";
import Conf from "../../../ode-framework-conf";
import { renderIcon } from "../utils/image";


export const Item = ({onEvent, ...item}: IItem & IEventProps) => {
  const {id, isFolder, name, date} = item;

  return (
    <TouchableOpacity style={style.item_flexrow} onPress={() => onEvent( EVENT_TYPE.SELECT, item)}>
      <LeftIconPanel>
        {renderIcon( id, isFolder, name)}
      </LeftIconPanel>
      <CenterPanel>
        <View style={style.LeftTopPosition}>
          <Text numberOfLines={1} style={style.textHeader}>{name}</Text>
        </View>
        <View style={style.LeftBottomPosition}>
          <DateView date={date} min/>
        </View>
      </CenterPanel>
    </TouchableOpacity>
  )
};
