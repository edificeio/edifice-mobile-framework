
import * as React from 'react';
import { View, Text, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import PresenceCard from './PresenceCard';

class History extends React.PureComponent<{data: any}> {
  constructor(props) {
    super(props);
  }

  public render() {
    const { absences, retards, empty } = this.props.data;
    return (
      <View>
        <ScrollView contentContainerStyle={[style.container]}>
          <Text style={style.selector}>Sélecteur de période</Text>
          <PresenceCard color="red" title="Absences non justifiées" elements={absences}/>
          <PresenceCard color="salmon" title="Absences justifiées" elements={absences}/>
          <PresenceCard color="purple" title="Retards" elements={retards}/>
          <PresenceCard color="grey" title="Incidents" elements={empty}/>
          <PresenceCard color="#55EE88" title="Carnets Oubliés" elements={empty}/>
          <PresenceCard color="#338888" title="Départs Anticipés" elements={empty}/>
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
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 2,
  },
});

export default History;