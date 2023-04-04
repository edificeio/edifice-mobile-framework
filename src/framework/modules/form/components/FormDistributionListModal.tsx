import I18n from 'i18n-js';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-tiny-toast';

import theme from '~/app/theme';
import ModalBox, { ModalBoxHandle } from '~/framework/components/ModalBox';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';
import { assertSession } from '~/framework/modules/auth/reducer';
import { DistributionStatus, IDistribution, IForm } from '~/framework/modules/form/model';
import { formService } from '~/framework/modules/form/service';

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },
  itemIconMargin: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  titleMargin: {
    marginTop: UI_SIZES.spacing.small,
  },
  flatListContainer: {
    marginVertical: UI_SIZES.spacing.medium,
    maxHeight: 300,
  },
});

interface IFormDistributionListModalProps {
  distributions?: IDistribution[];
  form?: IForm;
  openDistribution: (id: number, status: DistributionStatus, form: IForm) => void;
}

const compareDistributions = (a: IDistribution, b: IDistribution): number => {
  if (!a.dateResponse || !b.dateResponse || a.dateResponse.isSame(b.dateResponse)) return 0;
  return a.dateResponse.isAfter(b.dateResponse) ? 1 : -1;
};

const FormDistributionListModal = React.forwardRef<ModalBoxHandle, IFormDistributionListModalProps>((props, ref) => {
  const [isLoading, setLoading] = React.useState(false);
  const data =
    props.distributions?.filter(distribution => distribution.status === DistributionStatus.FINISHED).sort(compareDistributions) ??
    [];

  const openDistributionCallback = (id: number, status: DistributionStatus) => {
    const { form } = props;

    if (!form) return Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    props.openDistribution(id, status, form);
  };

  const openSentDistribution = async (id: number) => {
    const { distributions, form } = props;

    if (form?.editable) {
      let distribution = distributions?.find(d => d.originalId === id && d.status === DistributionStatus.ON_CHANGE);
      if (!distribution) {
        try {
          const session = assertSession();
          distribution = await formService.distribution.duplicate(session, id);
        } catch (e) {
          Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
          throw e;
        }
      }
      openDistributionCallback(distribution.id, distribution.status);
    } else {
      openDistributionCallback(id, DistributionStatus.FINISHED);
    }
  };

  const onAnswerAgain = async () => {
    try {
      const { distributions } = props;
      let distribution = distributions?.find(d => d.status === DistributionStatus.TO_DO);

      if (!distribution) {
        setLoading(true);
        const session = assertSession();
        if (!session || !distributions) throw new Error();
        distribution = await formService.distribution.add(session, distributions[0].id);
        setLoading(false);
      }
      openDistributionCallback(distribution.id, distribution.status);
    } catch {
      setLoading(false);
      Toast.show(I18n.t('common.error.text'), { ...UI_ANIMATIONS.toast });
    }
  };

  const renderListItem = (distribution: IDistribution, index: number) => {
    const { dateResponse } = distribution;
    const text = `${index}. ${I18n.t('form.answeredOnDate', { date: dateResponse?.format('DD/MM/YYYY, HH:mm') })}`;
    return (
      <TouchableOpacity onPress={() => openSentDistribution(distribution.id)} style={styles.itemContainer}>
        <SmallText>{text}</SmallText>
        <Picture
          type="NamedSvg"
          width={20}
          height={20}
          name="ui-eye"
          fill={theme.palette.primary.regular}
          style={styles.itemIconMargin}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ModalBox
      ref={ref}
      content={
        <View>
          <BodyText style={styles.titleMargin}>{`${I18n.t('form.myAnswers')} - ${props.form?.title}`}</BodyText>
          <FlatList
            data={data}
            initialNumToRender={data.length}
            keyExtractor={distribution => distribution.id.toString()}
            renderItem={({ item, index }) => renderListItem(item, index + 1)}
            persistentScrollbar
            style={styles.flatListContainer}
          />
          <ActionButton text={I18n.t('form.answerAgain')} action={() => onAnswerAgain()} loading={isLoading} />
        </View>
      }
    />
  );
});

export default FormDistributionListModal;
