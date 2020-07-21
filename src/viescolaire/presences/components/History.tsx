import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NavigationScreenProp } from "react-navigation";

import Dropdown from "../../../ui/Dropdown";
import { Text, TextBold } from "../../../ui/Typography";
import ChildPicker from "../../viesco/containers/ChildPicker";
import PresenceCard from "./PresenceCard";

type HistoryProps = {
  data: any;
  events: any;
  periods: any;
  onPeriodChange: any;
  navigation: NavigationScreenProp<any>;
  selected: number;
};

class History extends React.PureComponent<HistoryProps> {
  renderAbsence = (event, color) => {
    return (
      <Text>
        <Text style={{ color }}>▪</Text>
        <TextBold> {event.start_date.format("DD/MM/YY")} - </TextBold>
        {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")}
      </Text>
    );
  };

  renderLatenessDeparture = (event, color) => {
    return (
      <Text>
        <Text style={{ color }}>▪</Text>
        <TextBold> {event.start_date.format("DD/MM/YY")} - </TextBold>
        {event.type_id === 2 && (
          <>
            {event.end_date.format("H:mm")}
            <TextBold> - {event.end_date.diff(event.start_date, "minutes")}mn</TextBold>
          </>
        )}
        {event.type_id === 3 && (
          <>
            {event.start_date.format("H:mm")}
            <TextBold> - {Math.abs(event.start_date.diff(event.end_date, "minutes"))}mn</TextBold>
          </>
        )}
      </Text>
    );
  };

  renderForgottenNotebook = (event, color) => {
    return (
      <Text>
        <Text style={{ color }}>▪</Text>
        <TextBold> {event.date.format("DD/MM/YY")}</TextBold>
      </Text>
    );
  };

  renderIncident = (event, color) => {
    return (
      <Text>
        <Text style={{ color }}>▪</Text>
        <TextBold> {event.date.format("DD/MM/YY H:mm")} : </TextBold>
        <Text>{event.label}</Text>
      </Text>
    );
  };

  renderPunishment = (event, color) => {
    return (
      <Text>
        <Text style={{ color }}>▪</Text>
        <TextBold> {event.start_date.format("DD/MM/YY")} - </TextBold>
        {event.start_date.format("H:mm")} - {event.end_date.format("H:mm")} - {event.label}
      </Text>
    );
  };

  renderOption = option => {
    return I18n.t("viesco-trimester") + " " + option.order;
  };

  keyExtractor = item => {
    return item.order;
  };

  public render() {
    const { events, onPeriodChange, selected, periods } = this.props;
    return (
      <View>
        {this.props.navigation.state.params.user_type === "Relative" && <ChildPicker hideButton />}
        <ScrollView contentContainerStyle={[style.container]}>
          <Dropdown
            style={style.selector}
            value={selected}
            data={periods.data}
            onSelect={onPeriodChange}
            renderItem={this.renderOption}
            keyExtractor={this.keyExtractor}
          />
          <PresenceCard
            color="red"
            title={I18n.t("viesco-history-unjustified")}
            elements={events.unjustified}
            renderEvent={this.renderAbsence}
          />
          <PresenceCard
            color="salmon"
            title={I18n.t("viesco-history-justified")}
            elements={events.justified}
            renderEvent={this.renderAbsence}
          />
          <PresenceCard
            color="purple"
            title={I18n.t("viesco-history-latenesses")}
            elements={events.lateness}
            renderEvent={this.renderLatenessDeparture}
          />
          <PresenceCard
            color="#338888"
            title={I18n.t("viesco-history-departures")}
            elements={events.departure}
            renderEvent={this.renderLatenessDeparture}
          />
          <PresenceCard
            color="#55EE88"
            title={I18n.t("viesco-history-forgotten-notebooks")}
            elements={events.notebooks}
            renderEvent={this.renderForgottenNotebook}
          />
          <PresenceCard
            color="grey"
            title={I18n.t("viesco-history-incidents")}
            elements={events.incidents}
            renderEvent={this.renderIncident}
          />
          <PresenceCard
            color="gold"
            title={I18n.t("viesco-history-punishments")}
            elements={events.punishments}
            renderEvent={this.renderPunishment}
          />
        </ScrollView>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingBottom: 50,
  },
  selector: {
    margin: 3,
    backgroundColor: "white",
  },
});

export default History;
