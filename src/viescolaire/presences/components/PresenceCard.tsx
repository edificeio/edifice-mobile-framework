import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";

import { Text, TextBold } from "../../../ui/Typography";
import { BottomColoredItem } from "../../viesco/components/Item";

export default class PresenceCard extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      displayedElements: props.elements.slice(0, 2),
    };
  }

  toggleExpand = () => {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
      displayedElements: !expanded ? this.props.elements : this.props.elements.slice(0, 2),
    });
  };

  public render() {
    const { displayedElements, expanded } = this.state;
    const { color, title, elements } = this.props;
    return (
      <BottomColoredItem style={style.shadow} color={color}>
        <View style={[style.mainView, elements.length === 0 ? {} : style.bottomMargin]}>
          <Text style={style.title}>{title}</Text>
          <View style={style.flexRow}>
            <TextBold style={style.elementsNumber}>{elements.length}</TextBold>
            {elements.length === 0 && <Text style={style.emptyText}>{I18n.t("viesco-empty-card")}</Text>}
            <View style={style.justifyCenter}>
              {elements.length > 0 &&
                displayedElements.map(elem => (
                  <Text>
                    <Text style={{ color }}>▪</Text>
                    <TextBold>{elem.date} - </TextBold>
                    {elem.time}
                  </Text>
                ))}
            </View>
          </View>
        </View>
        {elements.length > 2 && (
          <Text onPress={this.toggleExpand} style={style.seeMore}>
            {expanded ? (
              <>
                {I18n.t("seeLess")} <TextBold>-</TextBold>
              </>
            ) : (
              <>
                {I18n.t("seeMore")} <TextBold>+</TextBold>
              </>
            )}
          </Text>
        )}
      </BottomColoredItem>
    );
  }
}

const style = StyleSheet.create({
  title: {
    fontSize: 16,
    textTransform: "uppercase",
    color: "gray",
  },
  mainView: {
    marginTop: 3,
    paddingHorizontal: 4,
  },
  bottomMargin: {
    marginBottom: 7,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  flexRow: { flexDirection: "row" },
  elementsNumber: {
    marginHorizontal: 30,
    fontSize: 48,
  },
  justifyCenter: {
    justifyContent: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  seeMore: {
    alignSelf: "flex-end",
  },
  emptyText: {
    alignSelf: "center",
    textAlign: "center",
    color: "grey",
    flexGrow: 1,
  },
});
