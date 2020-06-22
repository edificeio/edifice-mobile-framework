import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Text } from "../../../ui/text";
import PresenceCard from "./PresenceCard";

class History extends React.PureComponent<{ data: any }> {
  public render() {
    const { data } = this.props;
    const eventsByIds = {};
    data.forEach(event => {
      if (typeof eventsByIds[event.id] === "undefined") eventsByIds[event.id] = [];
      eventsByIds[event.id].push(event);
    });
    return (
      <View>
        <ScrollView contentContainerStyle={[style.container]}>
          <Text style={style.selector}>Sélecteur de période</Text>
          <PresenceCard color="red" title="Absences non justifiées" elements={eventsByIds[0] || []} />
          <PresenceCard color="salmon" title="Absences justifiées" elements={eventsByIds[1] || []} />
          <PresenceCard color="purple" title="Retards" elements={eventsByIds[2] || []} />
          <PresenceCard color="grey" title="Incidents" elements={eventsByIds[3] || []} />
          <PresenceCard color="#55EE88" title="Carnets Oubliés" elements={eventsByIds[4] || []} />
          <PresenceCard color="#338888" title="Départs Anticipés" elements={eventsByIds[5] || []} />
        </ScrollView>
      </View>
    );
  }
}

const style = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selector: {
    textAlign: "center",
    padding: 8,
    borderStyle: "solid",
    borderColor: "black",
    borderWidth: 2,
  },
});

export default History;
