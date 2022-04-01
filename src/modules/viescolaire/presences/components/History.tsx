import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';

import ChildPicker from '~/modules/viescolaire/viesco/containers/ChildPicker';
import { Loading } from '~/ui/Loading';
import Dropdown from '~/ui/Dropdown';

import {
  DepartureCard,
  ForgotNotebookCard,
  IncidentCard,
  LatenessCard,
  NoReasonCard,
  PunishmentCard,
  RegularizedCard,
  UnregularizedCard,
} from './PresenceCard';

type HistoryProps = {
  data: any;
  events: any;
  periods: any;
  onPeriodChange: (newPeriod) => void;
  navigation: NavigationScreenProp<any>;
  selected: number;
  isFetchingData: boolean;
  isPristineData: boolean;
};

class History extends React.PureComponent<HistoryProps> {
  renderOption = option => {
    if (option.order === -1) return I18n.t('viesco-fullyear');
    else return I18n.t('viesco-trimester') + ' ' + option.order;
  };

  public render() {
    const { events, onPeriodChange, selected, periods } = this.props;

    return (
      <View style={{ flex: 1 }}>
        {this.props.navigation.state.params.user_type === 'Relative' && <ChildPicker />}
        <ScrollView contentContainerStyle={style.container}>
          {periods !== undefined && periods.length > 1 && periods[0].code !== 'YEAR' && (
            <Dropdown
              style={{ alignSelf: 'center', width: '50%' }}
              data={periods}
              value={selected}
              onSelect={onPeriodChange}
              keyExtractor={item => item.order}
              renderItem={this.renderOption}
            />
          )}
          {this.props.isFetchingData || this.props.isPristineData ? (
            <Loading />
          ) : (
            <>
              <NoReasonCard elements={events.no_reason} />
              <UnregularizedCard elements={events.unregularized} />
              <RegularizedCard elements={events.regularized} />
              <LatenessCard elements={events.lateness} />
              <IncidentCard elements={events.incidents} />
              <PunishmentCard elements={events.punishments} />
              <ForgotNotebookCard elements={events.notebooks} />
              <DepartureCard elements={events.departure} />
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
    alignItems: 'stretch',
  },
});

export default History;
