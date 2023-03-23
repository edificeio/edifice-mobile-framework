import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { CardWithoutPadding, cardPadding } from '~/framework/components/card/base';
import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import type { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  CarnetDeBordSection,
  ICarnetDeBord,
  formatCarnetDeBordCompetencesValue,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  formatCarnetDeBordVieScolaireType,
} from '~/framework/modules/pronote/model/carnet-de-bord';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/pronote/navigation';
import redirect from '~/framework/modules/pronote/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayDate } from '~/framework/util/date';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { splitWords } from '~/framework/util/string';

export interface CarnetDeBordDetailsScreenDataProps {
  session?: ISession;
}

export interface CarnetDeBordDetailsScreenEventProps {}

export interface CarnetDeBordDetailsScreenNavigationParams {
  type: CarnetDeBordSection;
  data: ICarnetDeBord;
}

export type CarnetDeBordDetailsScreenProps = CarnetDeBordDetailsScreenDataProps &
  CarnetDeBordDetailsScreenEventProps &
  NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.carnetDeBordDetails>;

const PAGE_TITLE_I18N = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: 'pronote.carnetDeBord.cahierDeTextes.title',
  [CarnetDeBordSection.NOTES]: 'pronote.carnetDeBord.releveDeNotes.title',
  [CarnetDeBordSection.COMPETENCES]: 'pronote.carnetDeBord.competences.title',
  [CarnetDeBordSection.VIE_SCOLAIRE]: 'pronote.carnetDeBord.vieScolaire.title',
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<
  PronoteNavigationParams,
  typeof pronoteRouteNames.carnetDeBordDetails
>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t(PAGE_TITLE_I18N[route.params.type]),
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.medium,
  },
  section: {
    ...cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLeft: {
    flex: 1,
  },
  sectionRight: {
    flex: 0,
    textAlign: 'right',
    marginLeft: UI_SIZES.spacing.small,
  },
  sectionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  textDate: {
    color: theme.palette.grey.graphite,
  },
  textDateMargin: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  button: {
    marginTop: UI_SIZES.spacing.large,
    marginBottom: UI_SIZES.screen.bottomInset
      ? UI_SIZES.spacing.large + UI_SIZES.spacing.big - UI_SIZES.screen.bottomInset
      : UI_SIZES.spacing.large + UI_SIZES.spacing.medium,
  },
  message: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.big,
    marginBottom: UI_SIZES.spacing.big - UI_SIZES.spacing.medium,
  },
});

function CarnetDeBordDetailsScreen(props: CarnetDeBordDetailsScreenProps) {
  const type = props.route.params.type;
  const data = props.route.params.data;
  const items = React.useMemo(() => {
    const itemArray = CarnetDeBordDetailsScreen.getItems(type, data);
    return itemArray?.map((item, index) => (
      <View key={index} style={[styles.section, index + 1 < itemArray.length ? styles.sectionWithBorder : {}]}>
        <View style={styles.sectionLeft}>
          {item.title ? <SmallBoldText numberOfLines={1}>{item.title}</SmallBoldText> : null}
          {item.date ? (
            <CaptionBoldText
              style={[styles.textDate, item.label || item.description ? styles.textDateMargin : undefined]}
              numberOfLines={1}>
              {item.date}
            </CaptionBoldText>
          ) : null}
          {item.label ? <SmallBoldText numberOfLines={1}>{item.label}</SmallBoldText> : null}
          {item.description ? <SmallText numberOfLines={1}>{extractTextFromHtml(item.description)}</SmallText> : null}
        </View>
        {item.value ? (
          <SmallText numberOfLines={2} style={styles.sectionRight}>
            {item.value}
          </SmallText>
        ) : null}
      </View>
    ));
  }, [type, data]);

  const pageId = React.useMemo(() => {
    switch (type) {
      case CarnetDeBordSection.CAHIER_DE_TEXTES:
        return data.PagePronote?.['Travail à faire à la maison'];
      case CarnetDeBordSection.NOTES:
        return data.PagePronote?.['Mon relevé de notes'];
      case CarnetDeBordSection.COMPETENCES:
        return data.PagePronote?.['Évaluations par compétence'];
      case CarnetDeBordSection.VIE_SCOLAIRE:
        return data.PagePronote?.['Récapitulatif des évènements de la vie scolaire'];
    }
  }, [data, type]);

  return (
    <PageView>
      <ScrollView alwaysBounceVertical={false}>
        {type === CarnetDeBordSection.NOTES && data.PageReleveDeNotes?.Message ? (
          <SmallText style={styles.message}>{data.PageReleveDeNotes.Message}</SmallText>
        ) : null}
        <CardWithoutPadding style={styles.card}>{items}</CardWithoutPadding>
        <ActionButton
          style={styles.button}
          type="secondary"
          action={() => {
            if (data.address && props.session) redirect(props.session, data.address, pageId);
          }}
          iconName="pictos-external-link"
          text={I18n.t('pronote.carnetDeBord.openInPronote')}
        />
      </ScrollView>
    </PageView>
  );
}
CarnetDeBordDetailsScreen.getItems = (type: CarnetDeBordSection, data: ICarnetDeBord) => {
  switch (type) {
    case CarnetDeBordSection.CAHIER_DE_TEXTES: {
      return [...(data.PageCahierDeTextes?.TravailAFairePast ?? []), ...(data.PageCahierDeTextes?.TravailAFaireFuture ?? [])].map(
        taf => ({
          date: I18n.t('pronote.carnetDeBord.cahierDeTextes.PourDate', {
            date: taf.PourLe ? displayDate(taf.PourLe) : I18n.t('pronote.carnetDeBord.noInfo'),
          }),
          label: taf.Matiere || I18n.t('pronote.carnetDeBord.noInfo'),
          description: taf.Descriptif || `<p>${I18n.t('pronote.carnetDeBord.noInfo')}</p>`,
        }),
      );
    }
    case CarnetDeBordSection.NOTES: {
      return [...(data.PageReleveDeNotes?.DevoirsPast ?? []), ...(data.PageReleveDeNotes?.DevoirsFuture ?? [])].map(item => ({
        label: item.Matiere || I18n.t('pronote.carnetDeBord.noInfo'),
        date: item.Date ? displayDate(item.Date) : I18n.t('pronote.carnetDeBord.noInfo'),
        value: formatCarnetDeBordReleveDeNotesDevoirNoteBareme(item.Note, item.Bareme),
      }));
    }
    case CarnetDeBordSection.COMPETENCES: {
      return [...(data.PageCompetences?.CompetencesPast ?? []), ...(data.PageCompetences?.CompetencesFuture ?? [])].map(item => ({
        label: item.Matiere || I18n.t('pronote.carnetDeBord.noInfo'),
        date: item.Date ? displayDate(item.Date) : I18n.t('pronote.carnetDeBord.noInfo'),
        value: item.NiveauDAcquisition?.Genre
          ? splitWords(formatCarnetDeBordCompetencesValue(item.NiveauDAcquisition.Genre), 2)
          : I18n.t('pronote.carnetDeBord.noInfo'),
      }));
    }
    case CarnetDeBordSection.VIE_SCOLAIRE: {
      return [...(data.PageVieScolaire?.VieScolairePast ?? []), ...(data.PageVieScolaire?.VieScolaireFuture ?? [])].map(item => ({
        label: formatCarnetDeBordVieScolaireType(item?.type),
        date:
          item.type === 'Absence'
            ? item.DateDebut && item.DateFin
              ? item.DateDebut.isSame(item.DateFin, 'day')
                ? item.DateDebut.isSame(item.DateFin, 'minute')
                  ? displayDate(item.DateDebut) + I18n.t('common.space') + item.DateDebut.format('LT')
                  : displayDate(item.DateDebut) +
                    I18n.t('common.space') +
                    I18n.t('pronote.carnetDeBord.vieScolaire.dateFromTo', {
                      start: item.DateDebut.format('LT'),
                      end: item.DateFin.format('LT'),
                    })
                : I18n.t('pronote.carnetDeBord.vieScolaire.dateFromTo', {
                    start: displayDate(item.DateDebut),
                    end: displayDate(item.DateFin),
                  })
              : I18n.t('pronote.carnetDeBord.noInfo')
            : item.Date
            ? item.type === 'Retard' || item.type === 'PassageInfirmerie'
              ? displayDate(item.Date) + I18n.t('common.space') + item.Date.format('LT')
              : displayDate(item.Date)
            : I18n.t('pronote.carnetDeBord.noInfo'),
        description:
          item.type === 'Absence' || item.type === 'Retard'
            ? item.Motif || I18n.t('pronote.carnetDeBord.noInfo')
            : item.type === 'Punition' || item.type === 'Sanction'
            ? item.Nature || I18n.t('pronote.carnetDeBord.noInfo')
            : item.type === 'Observation'
            ? item.Observation || I18n.t('pronote.carnetDeBord.noInfo')
            : I18n.t('pronote.carnetDeBord.noInfo'),
      }));
    }
  }
};

export default connect(
  (state: IGlobalState) => ({
    session: getSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(CarnetDeBordDetailsScreen);
