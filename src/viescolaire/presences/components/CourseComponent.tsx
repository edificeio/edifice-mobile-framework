import I18n from "i18n-js";
import moment from "moment";
import React from "react";
import { ImageBackground, View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../ui";
import { TextBold } from "../../../ui/Typography";
import { BottomColoredItem } from "../../viesco/components/Item";
import { ICourses } from "../state/teacherCourses";

const styles = StyleSheet.create({
  itemContainer: { flex: 1, padding: 0 },
  imageBackgroundContainer: { flex: 1, overflow: "hidden" },
  imageBackground: {
    height: "100%",
    width: "100%",
    right: undefined,
    bottom: undefined,
    top: "20%",
    left: "30%",
  },
  itemContent: { flex: 1, padding: 15, justifyContent: "space-evenly" },
});

export default ({
  item,
  onPress,
  isCourseNow,
  isCourseEditable,
}: {
  item: ICourses;
  onPress: () => any;
  isCourseNow: boolean;
  isCourseEditable: boolean;
}) => (
  <BottomColoredItem
    shadow={isCourseNow}
    disabled={!isCourseEditable}
    onPress={onPress}
    style={[styles.itemContainer, { opacity: isCourseNow ? 1 : 0.4 }]}
    color="#FFB600">
    <ImageBackground
      source={require("../../../../assets/viesco/presences.png")}
      style={styles.imageBackgroundContainer}
      imageStyle={styles.imageBackground}
      resizeMode="contain">
      <View style={styles.itemContent}>
        <View style={{ flexDirection: "row" }}>
          <Icon style={{ marginRight: 10 }} size={20} name="access_time" />
          <Text>
            {moment(item.startDate).format("LT")} - {moment(item.endDate).format("LT")}
          </Text>
        </View>
        <TextBold style={{ fontSize: 20 }}>{item.classes[0] !== undefined ? item.classes : item.groups}</TextBold>

        {item.roomLabels[0] !== "" && (
          <View style={{ flexDirection: "row" }}>
            <Icon style={{ marginRight: 10 }} size={20} name="pin_drop" />
            <Text>
              {I18n.t("viesco-room")} {item.roomLabels}
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  </BottomColoredItem>
);
