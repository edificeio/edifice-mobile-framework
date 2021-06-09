import I18n from "i18n-js";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import { Text, NestedText, TextBold, NestedTextBold } from "../../../../ui/text";
import { BottomColoredItem } from "../../viesco/components/Item";

const colors = {
  no_reason: "#E61610",
  unregularized: "#FA8A85",
  regularized: "#72bb53",
  lateness: "#9C29B7",
  departure: "#28A1AC",
  forgotNotebook: "#B0EAD5",
  incident: "#D6D6D6",
  punishment: "#FCB602",
};

interface PresenceCardProps {
  color: string;
  title: string;
  subNumber?: string;
  elements: any[];
  renderItem: (item: any) => React.ReactElement;
}

const style = StyleSheet.create({
  title: {
    fontSize: 16,
    textTransform: "uppercase",
    color: "gray",
  },
  leftColumn: { width: "30%", alignItems: "center" },
});

const PresenceCard: React.FunctionComponent<PresenceCardProps> = ({
  color,
  title,
  elements = [],
  subNumber,
  renderItem,
}) => {
  const [expanded, setExpanded] = useState(false);

  const numberChildren = elements.length;
  const displayedElements = expanded ? elements : elements.slice(0, 2);

  const renderChild = item => {
    return (
      <Text style={{ marginVertical: 2 }}>
        <NestedText style={{ color, fontSize: 10 }}>{"\u25A0 "}</NestedText>
        {renderItem(item)}
      </Text>
    );
  };

  const renderMore = () => (
    <Text onPress={() => setExpanded(!expanded)} style={{ alignSelf: "flex-end" }}>
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
  );

  return (
    <BottomColoredItem shadow color={color}>
      <Text style={style.title}>{title}</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={style.leftColumn}>
          <NestedTextBold style={{ fontSize: 48 }}>{numberChildren}</NestedTextBold>
          {subNumber && <Text>{subNumber}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          {numberChildren !== 0 ? (
            displayedElements.map(renderChild)
          ) : (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={{ alignSelf: "center", color: "grey" }}>{I18n.t("viesco-empty-card")}</Text>
            </View>
          )}
          {numberChildren > 2 && renderMore()}
        </View>
      </View>
    </BottomColoredItem>
  );
};

export const NoReasonCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.no_reason}
      title={I18n.t("viesco-history-noreason")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const UnregularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.unregularized}
      title={I18n.t("viesco-history-unregularized")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const RegularizedCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.regularized}
      title={I18n.t("viesco-history-regularized")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const LatenessCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.end_date.format("H:mm")}
      <NestedTextBold> - {event.end_date.diff(event.start_date, "minutes")}mn</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard
      color={colors.lateness}
      title={I18n.t("viesco-history-latenesses")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const DepartureCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.start_date.format("H:mm")}
      <NestedTextBold> - {Math.abs(event.start_date.diff(event.end_date, "minutes"))}mn</NestedTextBold>
    </Text>
  );
  return (
    <PresenceCard
      color={colors.departure}
      title={I18n.t("viesco-history-departures")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const ForgotNotebookCard = ({ elements }) => {
  const renderItem = event => <TextBold> {event.date.format("DD/MM/YY")}</TextBold>;
  return (
    <PresenceCard
      color={colors.forgotNotebook}
      title={I18n.t("viesco-history-forgotten-notebooks")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const IncidentCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.date.format("DD/MM/YY H:mm")} : </NestedTextBold>
      <NestedText>{event.label}</NestedText>
    </Text>
  );
  return (
    <PresenceCard
      color={colors.incident}
      title={I18n.t("viesco-history-incidents")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};

export const PunishmentCard = ({ elements }) => {
  const renderItem = event => (
    <Text>
      <NestedTextBold> {event.start_date.format("DD/MM/YY")} - </NestedTextBold>
      {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")} - {event.label}
    </Text>
  );
  return (
    <PresenceCard
      color={colors.punishment}
      title={I18n.t("viesco-history-punishments")}
      renderItem={renderItem}
      elements={elements}
    />
  );
};
