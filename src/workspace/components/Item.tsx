import * as React from "react";
import { TouchableOpacity, View, TextProps } from "react-native";
import I18n from "i18n-js";
import { IEventProps, IItem, EVENT_TYPE } from "../types";

import { Text, NestedText } from "../../ui/text";
import { CenterPanel, LeftIconPanel } from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import style from "../../styles";
import { renderIcon } from "../utils/image";
import { layoutSize } from "../../styles/common/layoutSize";
import { CommonStyles } from "../../styles/common/styles";

export const Item = ({ onEvent, ...item }: IItem & IEventProps) => {
  const { id, isFolder, name, date, ownerName = "" } = item;
  const longOwnerName = `${I18n.t("by")}${ownerName}`;

  return (
    <TouchableOpacity style={style.item_flexrow} onPress={() => onEvent(EVENT_TYPE.SELECT, item)}>
      <LeftIconPanel>{renderIcon(id, isFolder, name)}</LeftIconPanel>
      <CenterPanel>
        <View style={date != 0 ? style.LeftTopPosition : style.leftMiddlePosition}>
          <Text numberOfLines={1} style={style.textHeader}>
            {name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", width: "100%" }}>
          {date != 0 && (
            <View style={{ flex: 1, alignItems: "flex-start" }}>
              <DateView min date={date} />
            </View>
          )}
          {ownerName.length > 0 && (
            <View style={{ flex: 3, alignItems: "flex-end" }}>
              <NestedText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: layoutSize.LAYOUT_10,
                  color: CommonStyles.lightTextColor,
                }}
              >
                {longOwnerName}
              </NestedText>
            </View>
          )}
        </View>
      </CenterPanel>
    </TouchableOpacity>
  );
};
