import * as React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IEventProps, EVENT_TYPE } from "../types";
import I18n from "i18n-js";

import { ButtonIconText, Icon } from "../../ui";
import {DEVICE_WIDTH, layoutSize} from "../../styles/common/layoutSize";
import { IFile } from "../types/states";
import { renderImage } from "../utils/image";
import {CommonStyles} from "../../styles/common/styles";

const styles = StyleSheet.create({
  mainPanel: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: CommonStyles.lightGrey,
  },
  buttonPanel: {
    position: 'absolute',
    flex: 1,
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    right: 0,
    height: layoutSize.LAYOUT_50,
    justifyContent: 'space-around',
  },
  imagePanel: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flex: 1,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: 'center',
  }
});


export const ItemDetails = ({ onEvent, ...item }: IFile & IEventProps) => {
  const { id, name } = item;

  return (
    <View style={styles.mainPanel}>
      <TouchableOpacity style={styles.imagePanel} onPress={() => onEvent(EVENT_TYPE.PREVIEW, item)}>
          {renderImage(item, false, name)}
      </TouchableOpacity>
      <View  style={styles.buttonPanel}>
        <ButtonIconText
          name="download"
          onPress={() => onEvent(EVENT_TYPE.DOWNLOAD, item)}/>
        <ButtonIconText
          name="share-variant"
          onPress={() => onEvent(EVENT_TYPE.SHARE, item)} />
      </View>
    </View>
  )
};
