import * as React from "react"
import { StyleSheet, View } from "react-native";
import { IEventProps, FilterId, EVENT_TYPE } from "../types";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { TextH1 } from "../../ui/text";
import { layoutSize } from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderIcon } from "../utils/image";
import { TouchCard } from "../../ui/Card";
import I18n from "i18n-js";

const styles = StyleSheet.create({
  contentPanel: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  touchCard: {
    height: "80%",
    width: "80%",
    alignItems: "center",
    justifyContent: "space-evenly",
  }
});


export const ItemDetails = ({onEvent, ...item} : IFile & IEventProps) => {
  const iconStyle = { width: '100%', height: layoutSize.LAYOUT_100 }
  const {id, name} = item;

  return (
    <View>
      <View>
        {renderIcon(id, false, name, iconStyle)}
      </View>
      <View style={styles.contentPanel}>
        <TouchCard style={styles.touchCard} onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}>
          <Icon color={CommonStyles.profileTypes.Student} size={layoutSize.LAYOUT_60} name="download"/>
          <TextH1>{I18n.t("download")}</TextH1>
        </TouchCard>
        <TouchCard style={styles.touchCard} onPress={() => onEvent(EVENT_TYPE.SHARE, item)}>
          <Icon color={CommonStyles.profileTypes.Student} size={layoutSize.LAYOUT_60} name="share-variant"/>
          <TextH1>{I18n.t("share")}</TextH1>
        </TouchCard>
      </View>
    </View>
  )
};
