import style from "glamorous-native";
import * as React from "react";
import { Row, RowProperties } from ".";
import { CommonStyles } from "../styles/common/styles";
import { Icon } from "./icons/Icon";
import { connect } from "react-redux";
import { View, ActivityIndicator } from "react-native";
import styles from "../styles";
import { Weight } from "./Typography";

export interface ValidTextIconProps {
  disabled?: boolean;
  fontSize?: number;
  leftName?: string;
  onPress?: any;
  rightName?: string;
  style?: any;
  title?: string;
  whiteSpace?: string;
  keyboardShow?: boolean;
  loading: boolean; // FIXME? Loading shouldn't be in state as it can change over time ?
}

export interface State {
  marginTop: any;
}

const Disable = () => <View style={styles.Disable} />;

export const FlatButton = ({
  disabled = false,
  leftName = "",
  keyboardShow,
  onPress,
  rightName = "",
  title = "",
  whiteSpace = " ",
  loading = false
}: ValidTextIconProps) => {
  if (loading) {
    return <ActivityIndicator size="large" color={CommonStyles.primary} />;
  }

  return (
    <ValidStyle onPress={() => onPress()} disabled={disabled}>
      <ButtonStyle disabled={disabled}>
        <TextStyle disabled={disabled}>
          {leftName.length > 0 && <Icon name={leftName} />}
          {whiteSpace}
          {title}
          {whiteSpace}
          {rightName.length > 0 && <Icon name={rightName} />}
        </TextStyle>
      </ButtonStyle>
      {disabled && <Disable />}
    </ValidStyle>
  );
};

const ValidStyle = (props: RowProperties) => (
  <Row
    alignItems="center"
    justifyContent="center"
    height={38}
    marginTop={0}
    {...props}
  />
);

const ButtonStyle = style.view(
  {
    borderRadius: 38 * 0.5,
    paddingHorizontal: 36,
    paddingVertical: 9
  },
  ({ disabled }) => ({
    backgroundColor: disabled ? "transparent" : CommonStyles.actionColor,
    borderColor: disabled ? CommonStyles.actionColor : CommonStyles.lightGrey,
    borderWidth: disabled ? 1 : 0
  })
);

const TextStyle = style.text(
  {
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14,
    fontWeight: Weight.SemiBold,
    textAlignVertical: "center"
  },
  ({ disabled }) => ({
    color: disabled ? CommonStyles.actionColor : CommonStyles.inverseColor
  })
);

const isSynced = (synced: boolean[]) => {
  if (synced === undefined) {
    return true;
  }
  return synced.reduce((acc, elemIsSync) => acc || elemIsSync, false);
};
