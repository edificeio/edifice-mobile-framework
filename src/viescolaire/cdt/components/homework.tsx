import * as React from "react";
import { View } from "react-native";

import { SquareCheckbox } from "../../../ui/forms/Checkbox";
import { TextBold, Text } from "../../../ui/text";
import { LeftColoredItem } from "../../viesco/components/Item";

export const HomeworkItem = ({ title, subtitle, checked, disabled, onChange }: any) => (
  <LeftColoredItem shadow style={{ alignItems: "center", flexDirection: "row" }} color="#FA9700">
    <View style={{ flex: 1, justifyContent: "space-evenly" }}>
      <TextBold>{title}</TextBold>
      <Text>{subtitle}</Text>
    </View>
    <SquareCheckbox disabled={disabled} value={checked} color="#FA9700" onChange={onChange} />
  </LeftColoredItem>
);
