import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../../../styles/common/styles";
import ConnectionTrackingBar from "../../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../../ui/ContainerContent";
import { Text } from "../../../../ui/text";
import CallList from "../../presences/containers/TeacherCallList";
import { BottomColoredItem } from "../components/Item";
import StructurePicker from "../containers/StructurePicker";

const style = StyleSheet.create({
  dashboardPart: { paddingVertical: 8, paddingHorizontal: 15 },
  coursesPart: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
    marginBottom: 10,
    height: 400,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridButtonContainer: {
    width: "50%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  gridButton: {
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  gridButtonText: {
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
});

interface ImageButtonProps {
  imageSrc: string;
  color: string;
  text: string;
  onPress: any;
  disabled?: boolean;
}

const ImageButton = ({ imageSrc, color, text, onPress, disabled }: ImageButtonProps) => {
  return (
    <View style={style.gridButtonContainer}>
      <BottomColoredItem
        shadow
        style={[
          {
            alignItems: "center",
            flexDirection: "column",
            backgroundColor: "#FFF",
          },
          { opacity: disabled ? 0.6 : 1 },
        ]}
        color={color}
        onPress={onPress}
        disabled={disabled}>
        <Image source={imageSrc} style={{ height: 70, width: 70 }} resizeMode="contain" />
        <Text>{text}</Text>
      </BottomColoredItem>
    </View>
  );
};

export default props => (
  <PageContainer>
    <ConnectionTrackingBar />
    <ScrollView overScrollMode="never" bounces={false}>
      <View style={style.coursesPart}>
        <StructurePicker />
        <CallList {...props} />
      </View>
      <View style={style.dashboardPart}>
        <View style={style.grid}>
          <ImageButton
            onPress={() => props.navigation.navigate("Timetable")}
            text={I18n.t("viesco-timetable")}
            color="#162EAE"
            imageSrc={require("../../../../../assets/viesco/edt.png")}
          />
          <ImageButton
            onPress={() => true}
            text={I18n.t("Homework")}
            color="#2BAB6F"
            imageSrc={require("../../../../../assets/viesco/cdt.png")}
            disabled
          />
        </View>
      </View>
    </ScrollView>
  </PageContainer>
);
