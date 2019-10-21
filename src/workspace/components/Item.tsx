import * as React from "react"
import { TouchableOpacity, View } from "react-native";
import I18n from "i18n-js";
import { IEventProps, IItem, EVENT_TYPE } from "../types";

import {Text, TextMin} from "../../ui/text";
import { CenterPanel, LeftIconPanel } from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import style from "../../styles"
import { renderIcon } from "../utils/image";


export const Item = ({onEvent, ...item}: IItem & IEventProps) => {
  const {id, isFolder, name, date, ownerName = ""} = item;

  return (
    <TouchableOpacity style={style.item_flexrow} onPress={() => onEvent( EVENT_TYPE.SELECT, item)}>
      <LeftIconPanel>
        {renderIcon( id, isFolder, name)}
      </LeftIconPanel>
      <CenterPanel>
        <View style={date != 0 ? style.LeftTopPosition : style.leftMiddlePosition}>
          <Text numberOfLines={1} style={style.textHeader}>{name}</Text>
        </View>
        {date != 0 && <View style={style.LeftBottomPosition}><DateView date={date} min/></View>}
        {ownerName.length > 0 && <View style={style.RightBottomPosition}><TextMin>{I18n.t("by")}{ownerName}</TextMin></View>}
      </CenterPanel>
    </TouchableOpacity>
  )
};
