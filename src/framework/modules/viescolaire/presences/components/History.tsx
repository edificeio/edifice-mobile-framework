import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { SmallBoldText } from '~/framework/components/text';
import { UserType } from '~/framework/modules/auth/service';
import ChildPicker from '~/framework/modules/viescolaire/common/components/ChildPicker';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
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

const styles = StyleSheet.create({
  declareAbsenceButton: {
    backgroundColor: viescoTheme.palette.presences,
    marginLeft: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 5,
  },
  declareAbscenceText: {
    color: theme.ui.text.inverse,
  },
  mainView: {
    flex: 1,
  },
  container: {
    padding: UI_SIZES.spacing.medium,
    alignItems: 'stretch',
  },
  dropdownStyle: {
    alignSelf: 'center',
    width: '50%',
  },
});

type HistoryProps = {
  data: any;
  events: any;
  periods: any;
  onPeriodChange: (newPeriod) => void;
  navigation: NavigationScreenProp<any>;
  selected: number;
  isFetchingData: boolean;
  isPristineData: boolean;
  userType: any;
  hasRightToCreateAbsence: boolean;
};

class History extends React.PureComponent<HistoryProps> {
  renderChildPicker = () => {
    return this.props.hasRightToCreateAbsence ? (
      <ChildPicker>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(presencesRouteNames.declareAbsence)}
          style={styles.declareAbsenceButton}>
          <SmallBoldText style={styles.declareAbscenceText}>{I18n.t('viesco-declareAbsence')}</SmallBoldText>
        </TouchableOpacity>
      </ChildPicker>
    ) : (
      <ChildPicker />
    );
  };

  renderOption = option => {
    if (option.order === -1) return I18n.t('viesco-fullyear');
    else return I18n.t('viesco-trimester') + ' ' + option.order;
  };

  public render() {
    const { events, onPeriodChange, selected, periods } = this.props;

    return (
      <View style={styles.mainView}>
        {this.props.userType === UserType.Relative ? this.renderChildPicker() : null}
        <ScrollView contentContainerStyle={styles.container}>
          {periods !== undefined && periods.length > 1 && periods[0].code !== 'YEAR' && (
            <Dropdown
              style={styles.dropdownStyle}
              data={periods}
              value={selected}
              onSelect={onPeriodChange}
              keyExtractor={item => item.order}
              renderItem={this.renderOption}
            />
          )}
          {this.props.isFetchingData || this.props.isPristineData ? (
            <LoadingIndicator />
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

export default History;
