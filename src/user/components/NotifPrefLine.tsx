import style from "glamorous-native";
import * as React from "react";
import I18n from "i18n-js";

import { Line } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Toggle } from "../../ui/forms/Toggle";
import { Label } from "../../ui/Typography";

const Container = style(TouchableOpacity)({
  alignItems: "center",
  backgroundColor: "white",
  borderBottomWidth: 1,
  borderColor: "#ddd",
  flexDirection: "row",
  height: 46,
  justifyContent: "flex-start"
});

export const NotifPrefLine = ({ i18nKey, value, onCheck, onUncheck }) => {
  return (
    <Container
      style={{ marginBottom: 10, marginTop: 10, paddingHorizontal: 20 }}
      onPress={() => (value ? onUncheck() : onCheck())}
    >
      <Line style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Label style={{ flex: 1 }}>{I18n.t(i18nKey.replace(".", "-"))}</Label>
        <Toggle
          checked={value}
          onCheck={() => onCheck()}
          onUncheck={() => onUncheck()}
        />
      </Line>
    </Container>
  );
};
