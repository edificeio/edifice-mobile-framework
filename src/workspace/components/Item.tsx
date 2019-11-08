import * as React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "i18n-js";
import { IEventProps, IItem, EVENT_TYPE } from "../types";

import { Text, NestedText } from "../../ui/text";
import { CenterPanel, LeftIconPanel, ListItem } from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import { renderIcon } from "../utils/image";
import { layoutSize } from "../../styles/common/layoutSize";
import { CommonStyles } from "../../styles/common/styles";

const style = StyleSheet.create({
  item_flexrow: {
    backgroundColor: "white",
    flexDirection: "row",
    paddingHorizontal: layoutSize.LAYOUT_16,
    paddingVertical: layoutSize.LAYOUT_12,
  },
  centerPanel: {
    alignItems: "stretch",
    justifyContent: "space-around",
  },
  fileName: {
    color: CommonStyles.shadowColor,
    fontSize: layoutSize.LAYOUT_14,
  },
  date: { flex: 1, alignItems: "flex-start" },
  author: { flex: 3, alignItems: "flex-end" },
});

export const Item = ({ onEvent, ...item }: IItem & IEventProps) => {
  const { id, isFolder, name, date, ownerName = "" } = item;
  const longOwnerName = `${I18n.t("by")}${ownerName}`;

  return (
    <ListItem borderBottomWidth={0} onPress={() => onEvent(EVENT_TYPE.SELECT, item)}>
      <LeftIconPanel>{renderIcon(id, isFolder, name)}</LeftIconPanel>
      <CenterPanel style={style.centerPanel}>
        <Text numberOfLines={1} style={style.fileName}>
          {name}
        </Text>
        {date != 0 && ownerName.length > 0 && (
          <View style={{ flexDirection: "row" }}>
            {date != 0 && (
              <View style={style.date}>
                <DateView min date={date} />
              </View>
            )}
            {ownerName.length > 0 && (
              <View style={style.author}>
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
        )}
      </CenterPanel>
    </ListItem>
  );
};
