import * as React from 'react';
import { ScrollView, TextInput, View } from 'react-native';

import { StaticScreenProps } from '@react-navigation/native';

import { Log } from '~/app/log';
import { defineModal } from '~/app/navigation-new';
import theme, { defaultTheme } from '~/app/theme';
import { TerciaryButton } from '~/framework/components/button';
import IconButton from '~/framework/components/buttons/icon';
import FlatList from '~/framework/components/list/flat-list';
import { BodyText } from '~/framework/components/text';
import { DebugLogItem } from '~/modules/debug/components/log-item';
import type { LogData } from '~/modules/debug/model';
import { filterLogs, parseLog } from '~/modules/debug/model/business';
import { getSeverityColor } from '~/modules/debug/util';

import styles from './styles';

// The log is read again at this interval while the screen is open, to show the new entries
const LOG_REFRESH_INTERVAL = 1000;

const ItemSeparator = () => (
  <View style={styles.separatorContainer}>
    <View style={styles.separator} />
  </View>
);

export const LogScreen = ({}: StaticScreenProps<undefined>) => {
  const [dataToLog, setDataToLog] = React.useState<LogData[]>([]);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState<string>('');
  const [selectedItem, setSelectedItem] = React.useState<LogData | null>(null);
  const [showList, setShowList] = React.useState<boolean>(true);

  React.useEffect(() => {
    const getDebugLogs = async () => {
      const debugLogs = await Log.contentsAsArray();
      setDataToLog(debugLogs.map(parseLog));
    };
    getDebugLogs();
    const interval = setInterval(getDebugLogs, LOG_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const filteredData = React.useMemo(() => filterLogs(dataToLog, query), [dataToLog, query]);

  const clearLog = React.useCallback(() => {
    Log.clear();
    setDataToLog([]);
  }, []);

  const toggleListDetails = React.useCallback((item: LogData | null) => {
    setSelectedItem(item);
    setShowList(previous => !previous);
  }, []);

  const togglePauseResume = React.useCallback(() => {
    if (isPaused) {
      Log.resume();
    } else {
      Log.pause();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  const renderDetails = () => {
    const { message, severity } = selectedItem || {};
    return (
      <>
        <View style={styles.detailsBarContainer}>
          <BodyText style={[styles.logSeverity, { color: getSeverityColor(severity || '') }]}>{severity}</BodyText>
          <TerciaryButton text="Close" onPress={() => toggleListDetails(null)} testID="debug-log-close" />
        </View>
        <ScrollView>
          <BodyText style={styles.logDetailsContainer}>{message}</BodyText>
        </ScrollView>
      </>
    );
  };

  const renderItem = React.useCallback(
    ({ item }: { item: LogData }) => <DebugLogItem item={item} onPress={toggleListDetails} />,
    [toggleListDetails],
  );

  const renderList = () => {
    if (showList) {
      return (
        <>
          {renderPaused()}
          <View style={styles.searchBarContainer}>
            <TextInput value={query} onChangeText={setQuery} style={styles.searchBar} placeholder="Search..." />
            <IconButton
              style={styles.searchBarButton}
              color={defaultTheme.palette.status.failure.regular}
              icon="ui-delete"
              action={clearLog}
            />
            <IconButton style={styles.searchBarButton} color={theme.palette.grey.graphite} icon="ui-save" action={Log.share} />
            <IconButton
              style={styles.searchBarButton}
              color={theme.palette.grey.graphite}
              icon={isPaused ? 'ui-play' : 'ui-pause'}
              action={togglePauseResume}
            />
          </View>
          <FlatList data={filteredData} ItemSeparatorComponent={ItemSeparator} renderItem={renderItem} />
        </>
      );
    }
    return null;
  };

  const renderPaused = () => {
    if (isPaused) {
      return (
        <View style={styles.pausedBanner}>
          <BodyText>Paused, resume logging to see more...</BodyText>
        </View>
      );
    }
    return null;
  };

  return <View style={styles.page}>{showList ? renderList() : renderDetails()}</View>;
};

export default defineModal({
  options: () => ({ presentation: 'fullScreenModal', title: 'App Log' }),
  screen: LogScreen,
});
