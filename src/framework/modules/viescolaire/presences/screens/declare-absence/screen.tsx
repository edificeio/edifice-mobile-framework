import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import DateTimePicker from '~/framework/components/dateTimePicker';
import { DocumentPicked, ImagePicked, cameraAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getChildStructureId } from '~/framework/modules/viescolaire/common/utils/child';
import dashboardConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { Attachment } from '~/framework/modules/zimbra/components/Attachment';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';

import styles from './styles';
import type { PresencesDeclareAbsenceScreenPrivateProps } from './types';
import PrimaryButton from '~/framework/components/buttons/primary';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareAbsence>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-declareabsence-title'),
  }),
});

const PresencesDeclareAbsenceScreen = (props: PresencesDeclareAbsenceScreenPrivateProps) => {
  const [isSingleDay, setSingleDay] = React.useState<boolean>(true);
  const [startDate, setStartDate] = React.useState<Moment>(moment().startOf('day').hour(7));
  const [endDate, setEndDate] = React.useState<Moment>(moment().startOf('day').hour(18));
  const [comment, setComment] = React.useState<string>('');
  const [attachment, setAttachment] = React.useState<LocalFile | undefined>();
  const [isCreating, setCreating] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isSingleDay && !endDate.isSame(startDate, 'day')) {
      setEndDate(endDate.set({ dayOfYear: startDate.dayOfYear(), year: startDate.year() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleDay]);

  const setSingleDayDate = (date: Moment) => {
    setStartDate(startDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }));
    setEndDate(endDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }));
  };

  const onPickAttachment = (att: ImagePicked | DocumentPicked) => {
    setAttachment(new LocalFile(att as Asset | DocumentPicked, { _needIOSReleaseSecureAccess: false }));
  };

  const createAbsence = async () => {
    try {
      const { childId, navigation, session, structureId } = props;

      setCreating(true);
      if (!childId || !session || !structureId) throw new Error();
      if (attachment) {
        await presencesService.absence.createWithFile(session, structureId, childId, startDate, endDate, comment, attachment);
      } else {
        await presencesService.absence.create(session, structureId, childId, startDate, endDate, comment);
      }
      navigation.goBack();
      Toast.showSuccess(I18n.get('presences-declareabsence-successmessage'));
    } catch {
      setCreating(false);
      Toast.showError(I18n.get('presences-declareabsence-error-text'));
    }
  };

  React.useEffect(() => {
    const { childName, navigation } = props;

    navigation.setOptions({
      headerTitle: navBarTitle(`${I18n.get('presences-declareabsence-title')} ${childName}`),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.childName]);

  const renderPage = () => {
    const areDatesValid = startDate.isBefore(endDate) && startDate.isSameOrAfter(moment(), 'day');

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchPart, styles.leftSwitch, isSingleDay && styles.selected]}
              onPress={() => setSingleDay(true)}>
              <SmallText>{I18n.get('presences-declareabsence-singleday')}</SmallText>
              <SmallBoldText>{startDate.format('DD/MM')}</SmallBoldText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchPart, styles.rightSwitch, !isSingleDay && styles.selected]}
              onPress={() => setSingleDay(false)}>
              {isSingleDay ? (
                <View style={styles.rightSwitchSingle}>
                  <SmallText>{I18n.get('presences-declareabsence-severaldays')}</SmallText>
                  <SmallBoldText style={styles.rightSwitchSingleText}>+</SmallBoldText>
                </View>
              ) : (
                <View>
                  <SmallText>{I18n.get('presences-declareabsence-severaldays')}</SmallText>
                  <SmallBoldText>
                    {I18n.get('presences-declareabsence-dates', { start: startDate.format('DD/MM'), end: endDate.format('DD/MM') })}
                  </SmallBoldText>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.datePickersContainer}>
            {isSingleDay ? (
              <DateTimePicker
                mode="date"
                value={startDate}
                onChangeValue={date => setSingleDayDate(date)}
                minimumDate={moment().startOf('day')}
                iconColor={viescoTheme.palette.presences}
              />
            ) : (
              <>
                <DateTimePicker
                  mode="date"
                  value={startDate}
                  onChangeValue={date => setStartDate(startDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }))}
                  minimumDate={moment().startOf('day')}
                  maximumDate={endDate}
                  iconColor={viescoTheme.palette.presences}
                />
                <DateTimePicker
                  mode="date"
                  value={endDate}
                  onChangeValue={date => setEndDate(endDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }))}
                  minimumDate={startDate}
                  iconColor={viescoTheme.palette.presences}
                />
              </>
            )}
          </View>
          <View style={styles.timePickerMainContainer}>
            <View style={styles.timePickerContainer}>
              <SmallText style={styles.timePickerText}>{I18n.get('presences-declareabsence-from')}</SmallText>
              <DateTimePicker
                mode="time"
                value={startDate}
                onChangeValue={date => setStartDate(startDate.clone().set({ hour: date.hour(), minute: date.minute() }))}
                iconColor={viescoTheme.palette.presences}
              />
            </View>
            <View style={styles.timePickerContainer}>
              <SmallText style={styles.timePickerText}>{I18n.get('presences-declareabsence-to')}</SmallText>
              <DateTimePicker
                mode="time"
                value={endDate}
                onChangeValue={date => setEndDate(endDate.clone().set({ hour: date.hour(), minute: date.minute() }))}
                iconColor={viescoTheme.palette.presences}
              />
            </View>
          </View>
          <SmallText style={styles.commentLabelText}>{I18n.get('presences-declareabsence-reason')}</SmallText>
          <TextInput
            value={comment}
            onChangeText={text => setComment(text)}
            multiline
            textAlignVertical="top"
            style={styles.commentInput}
          />
          {attachment ? (
            <Attachment name={attachment.filename} type={attachment.filetype} onRemove={() => setAttachment(undefined)} />
          ) : (
            <BottomMenu
              title={I18n.get('presences-declareabsence-attachment')}
              actions={[
                cameraAction({ callback: onPickAttachment }),
                galleryAction({ callback: onPickAttachment }),
                documentAction({ callback: onPickAttachment }),
              ]}>
              <View style={styles.filePickerContainer}>
                <Picture
                  type="NamedSvg"
                  name="ui-attachment"
                  width={20}
                  height={20}
                  fill={theme.palette.primary.regular}
                  style={styles.iconAttMarginRight}
                />
                <SmallActionText>{I18n.get('presences-declareabsence-attachment')}</SmallActionText>
              </View>
            </BottomMenu>
          )}
        </View>
        <PrimaryButton
          text={I18n.get('presences-declareabsence-action')}
          action={createAbsence}
          disabled={!areDatesValid}
          loading={isCreating}
        />
      </ScrollView>
    );
  };

  const PageComponent = Platform.select<typeof KeyboardPageView | typeof PageView>({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect((state: IGlobalState) => {
  const dashboardState = dashboardConfig.getState(state);
  const session = getSession();
  const childId = dashboardState.selectedChildId;

  return {
    childId,
    childName: getFlattenedChildren(session?.user.children)?.find(child => child.id === childId)?.firstName,
    session,
    structureId: getChildStructureId(childId),
  };
})(PresencesDeclareAbsenceScreen);
