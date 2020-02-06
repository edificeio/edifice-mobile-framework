import * as React from "react";
import { View, StyleSheet } from "react-native";
import I18n from "i18n-js";
import { IEventProps, EVENT_TYPE } from "../types";

import { Text, NestedText } from "../../ui/text";
import { CenterPanel, LeftIconPanel, LeftSmallIconPanel, ListItem } from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import { renderIcon, renderSmallIcon } from "../utils/image";
import { layoutSize } from "../../styles/common/layoutSize";
import { CommonStyles } from "../../styles/common/styles";

const style = StyleSheet.create({
  centerPanel: {
    alignItems: "stretch",
    justifyContent: "space-around",
  },
  fileName: {
    color: CommonStyles.shadowColor,
    fontSize: layoutSize.LAYOUT_15,
  },
  fileNameSimple: {
    color: CommonStyles.shadowColor,
    fontSize: layoutSize.LAYOUT_14,
  },
  date: { flex: 1, alignItems: "flex-start" },
  author: { flex: 3, alignItems: "flex-end" },
});

export const Item = ({ onEvent, item, selected, simple }: IEventProps & any) => {
  const { id, isFolder, name, date, ownerName = "", contentType } = item;
  const longOwnerName = `${I18n.t("by")}${ownerName}`;

  return (
    <ListItem
      onLongPress={() => onEvent({ type: EVENT_TYPE.LONG_SELECT, id: item.id, item })}
      onPress={() => onEvent({ type: EVENT_TYPE.SELECT, id: item.id, item })}
      style={{ backgroundColor: selected ? "#2A9CC825" : "#fff", margin: simple ? -layoutSize.LAYOUT_6 : 0}}
      borderBottomWidth={0}>
      {simple ? (
        <LeftSmallIconPanel>{renderSmallIcon(id, isFolder, name, contentType)}</LeftSmallIconPanel>
      ) : (
        <LeftIconPanel>{renderIcon(id, isFolder, name, contentType)}</LeftIconPanel>
      )}
      <CenterPanel style={style.centerPanel}>
        <Text numberOfLines={1} style={simple ? style.fileNameSimple : style.fileName}>
          {name}
        </Text>
        {!simple && date !== 0 && ownerName.length > 0 && (
          <View style={{ flexDirection: "row" }}>
            {date !== 0 && (
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
                  }}>
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
