import * as React from 'react';
import { ColorValue, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import styles from './styles';
import { LogData } from './types';

import { Log } from '~/app/log';
import theme, { defaultTheme } from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import FlatList from '~/framework/components/list/flat-list';
import { PageView } from '~/framework/components/page';
import { BodyText } from '~/framework/components/text';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';

const parseLog = (log: string) => {
  const logRegex = /(\d{2}:\d{2}:\d{2})\s+\|\s+\w+\s+\|\s+(\w+)\s+:\s+(.*)/;
  const match = log.match(logRegex);
  if (match) {
    const [_, time, severity, message] = match;
    return { message, severity, time };
  }
  return { message: log, severity: null, time: null };
};

export function logNavBar({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Log>): NativeStackNavigationOptions {
  return {
    ...navBarOptions({
      navigation,
      route,
      title: 'Network Log',
    }),
  };
}

export const LogScreen = () => {
  const [dataToLog, setDataToLog] = React.useState<LogData[] | []>([]);
  const [filteredData, setFilteredData] = React.useState<LogData[] | []>([]);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [query, setQuery] = React.useState<string>('');
  const [selectedItem, setSelectedItem] = React.useState<LogData | null>(null);
  const [showList, setShowList] = React.useState<boolean>(true);

  React.useEffect(() => {
    const getDebugLogs = async () => {
      const debugLogs = await Log.contentsAsArray();
      const parsedLogs = debugLogs.map(parseLog) as LogData[];
      setDataToLog(parsedLogs);
      setFilteredData(parsedLogs);
    };
    getDebugLogs();
  }, [dataToLog]);

  React.useEffect(() => {
    if (query === '') {
      setFilteredData(dataToLog);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = dataToLog.filter(
        log =>
          log.message?.toLowerCase().includes(lowerCaseQuery) ||
          log.time?.toLowerCase().includes(lowerCaseQuery) ||
          log.severity?.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredData(filtered);
    }
  }, [query, dataToLog]);

  const clearLog = () => {
    Log.clear();
    setDataToLog([]);
  };

  const exportLogFile = async () => {
    try {
      const logFileExists = await RNFS.exists(Log.logFilePath);
      if (!logFileExists) {
        console.error('Log file does not exist');
        return;
      }
      await Share.open({
        title: 'Export log file',
        url: `file://${Log.logFilePath}`,
      });
    } catch (error) {
      console.error('Error exporting log file: ', error as Error);
    }
  };

  const getSeverityColor = (severity: string): ColorValue => {
    switch (severity) {
      case 'INFO':
        return defaultTheme.palette.status.info.regular;
      case 'WARN':
        return defaultTheme.palette.status.warning.regular;
      case 'ERROR':
        return defaultTheme.palette.status.failure.regular;
      default:
        return defaultTheme.palette.grey.black;
    }
  };

  const toggleListDetails = (item: LogData | null) => {
    setSelectedItem(item);
    setShowList(!showList);
  };

  const togglePauseResume = () => {
    if (isPaused) {
      Log.resume();
    } else {
      Log.pause();
    }
    setIsPaused(!isPaused);
  };

  const updateQuery = (value: string) => setQuery(value);

  const renderDetails = () => {
    const { message, severity } = selectedItem || {};
    return (
      <>
        <View style={styles.detailsBarContainer}>
          <BodyText style={[styles.logSeverity, { color: getSeverityColor(severity || '') }]}>{severity}</BodyText>
          <Text style={styles.detailsBarButton} onPress={() => toggleListDetails(null)}>
            Close
          </Text>
        </View>
        <ScrollView>
          <BodyText style={styles.logDetailsContainer}>{message}</BodyText>
        </ScrollView>
      </>
    );
  };

  const renderItem = ({ item }) => {
    const { message, severity, time } = item;
    return (
      <TouchableOpacity style={styles.logContainer} onPress={() => toggleListDetails(item)}>
        {time && severity ? (
          <View style={styles.logTimeAndSeverityContainer}>
            <BodyText style={[styles.logSeverity, { color: getSeverityColor(severity) }]}>{severity}</BodyText>
            <BodyText>{time}</BodyText>
          </View>
        ) : null}
        <View style={styles.logMessageContainer}>
          <BodyText ellipsizeMode="tail" numberOfLines={2}>
            {message}
          </BodyText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItemSeparator = () => (
    <View style={styles.separatorContainer}>
      <View style={styles.separator} />
    </View>
  );

  const renderList = () => {
    if (showList) {
      return (
        <>
          {renderPaused()}
          <View style={styles.searchBarContainer}>
            <TextInput value={query} onChangeText={updateQuery} style={styles.searchBar} placeholder="Search..." />
            <IconButton
              style={styles.searchBarButton}
              color={defaultTheme.palette.status.failure.regular}
              icon="ui-delete"
              action={clearLog}
            />
            <IconButton style={styles.searchBarButton} color={theme.palette.grey.graphite} icon="ui-save" action={exportLogFile} />
            <IconButton
              style={styles.searchBarButton}
              color={theme.palette.grey.graphite}
              icon={isPaused ? 'ui-play' : 'ui-pause'}
              action={togglePauseResume}
            />
          </View>
          <FlatList data={filteredData} ItemSeparatorComponent={renderItemSeparator} renderItem={renderItem} />
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

  return <PageView style={styles.page}>{showList ? renderList() : renderDetails()}</PageView>;
};
