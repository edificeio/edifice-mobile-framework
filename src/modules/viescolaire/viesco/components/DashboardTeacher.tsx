import I18n from 'i18n-js';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { NavigationActions } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import CallList from '~/modules/viescolaire/presences/containers/TeacherCallList';
import { BottomColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import StructurePicker from '~/modules/viescolaire/viesco/containers/StructurePicker';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import { PageContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  dashboardPart: { paddingVertical: UI_SIZES.spacing.minor, paddingHorizontal: UI_SIZES.spacing.medium },
  coursesPart: {
    backgroundColor: theme.palette.grey.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    marginBottom: UI_SIZES.spacing.small,
  },
  coursesPartHeight: {
    height: 'auto',
  },
  coursesPartHeightDefined: {
    height: 400,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  gridButtonContainer: {
    width: '50%',
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  gridButton: {
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: theme.palette.grey.white,
  },
  gridButtonEnabled: {
    opacity: 1,
  },
  gridButtonDisabled: {
    opacity: 0.6,
  },
  gridButtonImage: {
    height: 70,
    width: 70,
  },
});

interface ImageButtonProps {
  imageSrc: string;
  color: string;
  text: string;
  onPress: any;
  disabled?: boolean;
}

const ImageButtonModule = ({ imageSrc, color, text, onPress, disabled }: ImageButtonProps) => {
  return (
    <View style={styles.gridButtonContainer}>
      <BottomColoredItem
        shadow
        style={[styles.gridButton, disabled ? styles.gridButtonDisabled : styles.gridButtonEnabled]}
        color={color}
        onPress={onPress}
        disabled={disabled}>
        <Image source={imageSrc} style={styles.gridButtonImage} resizeMode="contain" />
        <SmallText>{text}</SmallText>
      </BottomColoredItem>
    </View>
  );
};

export default props => {
  return (
    <PageContainer>
      <ScrollView overScrollMode="never" bounces={false}>
        <View
          style={[
            styles.coursesPart,
            props.authorizedViescoApps.presences ? styles.coursesPartHeightDefined : styles.coursesPartHeight,
          ]}>
          <StructurePicker />
          {props.authorizedViescoApps.presences && <CallList {...props} />}
        </View>
        <View style={styles.dashboardPart}>
          <View style={styles.grid}>
            {props.authorizedViescoApps.edt && (
              <ImageButtonModule
                onPress={() => props.navigation.navigate('Timetable')}
                text={I18n.t('viesco-timetable')}
                color={viescoTheme.palette.timetable}
                imageSrc={require('ASSETS/viesco/edt.png')}
              />
            )}
            {props.authorizedViescoApps.diary && (
              <ImageButtonModule
                onPress={() =>
                  props.navigation.navigate(
                    'cdt',
                    {},
                    NavigationActions.navigate({
                      routeName: 'CdtTeachers',
                    }),
                  )
                }
                text={I18n.t('Homework')}
                color={viescoTheme.palette.diary}
                imageSrc={require('ASSETS/viesco/cdt.png')}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
};
