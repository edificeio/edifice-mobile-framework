import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import moment, { Moment } from 'moment';
import * as React from 'react';
import { Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import Toast from 'react-native-tiny-toast';
import { connect } from 'react-redux';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS } from '~/framework/components/constants';
import { DocumentPicked, ImagePicked, cameraAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { KeyboardPageView, PageView } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { SmallActionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';
import { getSelectedChild, getSelectedChildStructure } from '~/framework/modules/viescolaire/dashboard/state/children';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { Attachment } from '~/framework/modules/zimbra/components/Attachment';
import { navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import DateTimePicker from '~/ui/DateTimePicker';

import styles from './styles';
import { PresencesDeclareAbsenceScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareAbsence>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: `${I18n.t('viesco-absence-declaration')}`,
  headerStyle: {
    backgroundColor: viescoTheme.palette.presences,
  },
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
      Toast.showSuccess(I18n.t('viesco-absence-declared'), { ...UI_ANIMATIONS.toast });
    } catch {
      setCreating(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const renderPage = () => {
    const areDatesValid = startDate.isBefore(endDate) && startDate.isSameOrAfter(moment(), 'day');

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[styles.switchPart, styles.leftSwitch, isSingleDay && styles.selected]}
              onPress={() => setSingleDay(true)}>
              <SmallText>{I18n.t('viesco-single-day')}</SmallText>
              <SmallBoldText>{startDate.format('DD/MM')}</SmallBoldText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchPart, styles.rightSwitch, !isSingleDay && styles.selected]}
              onPress={() => setSingleDay(false)}>
              {isSingleDay ? (
                <View style={styles.rightSwitchSingle}>
                  <SmallText>{I18n.t('viesco-several-days')}</SmallText>
                  <SmallBoldText style={styles.rightSwitchSingleText}>+</SmallBoldText>
                </View>
              ) : (
                <View>
                  <SmallText>{I18n.t('viesco-several-days')}</SmallText>
                  <SmallBoldText>
                    {I18n.t('viesco-from')} {startDate.format('DD/MM')} {I18n.t('viesco-to')} {endDate.format('DD/MM')}
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
                onChange={date => setStartDate(startDate.set({ dayOfYear: date.dayOfYear(), year: date.year() }))}
                minimumDate={moment().startOf('day')}
                color={viescoTheme.palette.presences}
              />
            ) : (
              <>
                <DateTimePicker
                  mode="date"
                  value={startDate}
                  onChange={date => setStartDate(startDate.set({ dayOfYear: date.dayOfYear(), year: date.year() }))}
                  minimumDate={moment().startOf('day')}
                  maximumDate={endDate}
                  color={viescoTheme.palette.presences}
                />
                <DateTimePicker
                  mode="date"
                  value={endDate}
                  onChange={date => setEndDate(endDate.set({ dayOfYear: date.dayOfYear(), year: date.year() }))}
                  minimumDate={startDate}
                  color={viescoTheme.palette.presences}
                />
              </>
            )}
          </View>
          <View style={styles.timePickerMainContainer}>
            <View style={styles.timePickerContainer}>
              <SmallText style={styles.timePickerText}>{I18n.t('viesco-from-hour')}</SmallText>
              <DateTimePicker
                mode="time"
                value={startDate}
                onChange={date => setStartDate(startDate.set({ hour: date.hour(), minute: date.minute() }))}
                color={viescoTheme.palette.presences}
              />
            </View>
            <View style={styles.timePickerContainer}>
              <SmallText style={styles.timePickerText}>{I18n.t('viesco-to-hour')}</SmallText>
              <DateTimePicker
                mode="time"
                value={endDate}
                onChange={date => setEndDate(endDate.set({ hour: date.hour(), minute: date.minute() }))}
                color={viescoTheme.palette.presences}
              />
            </View>
          </View>
          <SmallText style={styles.commentLabelText}>{I18n.t('viesco-absence-motive')}</SmallText>
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
              title={I18n.t('viesco-attachment')}
              actions={[
                cameraAction({ callback: att => onPickAttachment(att) }),
                galleryAction({ callback: att => onPickAttachment(att) }),
                documentAction({ callback: att => onPickAttachment(att) }),
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
                <SmallActionText>{I18n.t('viesco-attachment')}</SmallActionText>
              </View>
            </BottomMenu>
          )}
        </View>
        <ActionButton
          text={I18n.t('viesco-validate')}
          action={createAbsence}
          disabled={!areDatesValid}
          loading={isCreating}
          style={styles.createAction}
        />
      </ScrollView>
    );
  };

  const PageComponent = Platform.select({ ios: KeyboardPageView, android: PageView })!;

  return <PageComponent>{renderPage()}</PageComponent>;
};

export default connect((state: IGlobalState) => {
  const session = getSession(state);
  const child = getSelectedChild(state);

  return {
    childId: child?.id,
    childName: child?.firstName,
    session,
    structureId: getSelectedChildStructure(state)?.id,
  };
})(PresencesDeclareAbsenceScreen);
