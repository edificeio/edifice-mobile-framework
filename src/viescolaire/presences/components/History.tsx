import I18n from "i18n-js";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { NavigationScreenProp } from "react-navigation";

import { Loading } from "../../../ui";
import Dropdown from "../../../ui/Dropdown";
import ChildPicker from "../../viesco/containers/ChildPicker";
import {
  UnjustifiedCard,
  JustifiedCard,
  LatenessCard,
  DepartureCard,
  ForgotNotebookCard,
  PunishmentCard,
  IncidentCard,
} from "./PresenceCard";

type HistoryProps = {
  data: any;
  events: any;
  periods: any;
  onPeriodChange: any;
  navigation: NavigationScreenProp<any>;
  selected: number;
  isFetchingData: boolean;
  isPristineData: boolean;
};

class History extends React.PureComponent<HistoryProps> {
  renderOption = option => {
    if (option.order === -1) return I18n.t("viesco-fullyear");
    else return I18n.t("viesco-trimester") + " " + option.order;
  };

  public render() {
    const { events, onPeriodChange, selected, periods } = this.props;
    return (
      <View style={{ flex: 1 }}>
        {this.props.navigation.state.params.user_type === "Relative" && <ChildPicker />}
        <ScrollView contentContainerStyle={style.container}>
          <Dropdown
            style={{ alignSelf: "center", width: "50%" }}
            data={periods}
            value={selected}
            onSelect={onPeriodChange}
            keyExtractor={item => item.order}
            renderItem={this.renderOption}
          />
          {this.props.isFetchingData || this.props.isPristineData ? (
            <Loading />
          ) : (
            <>
              <UnjustifiedCard elements={events.unjustified} />
              <JustifiedCard elements={events.justified} />
              <LatenessCard elements={events.lateness} />
              <DepartureCard elements={events.departure} />
              <ForgotNotebookCard elements={events.notebooks} />
              <IncidentCard elements={events.incidents} />
              <PunishmentCard elements={events.punishments} />
            </>
          )}
        </ScrollView>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    padding: 15,
    alignItems: "stretch",
  },
});

export default History;
