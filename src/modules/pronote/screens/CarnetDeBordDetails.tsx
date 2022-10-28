import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { CardWithoutPadding, cardPadding } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { CaptionBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { displayDate } from '~/framework/util/date';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { splitWords } from '~/framework/util/string';
import {
  CarnetDeBordSection,
  ICarnetDeBord,
  formatCarnetDeBordCompetencesValue,
  formatCarnetDeBordReleveDeNotesDevoirNoteBareme,
  formatCarnetDeBordVieScolaireType,
} from '~/modules/pronote/model/carnetDeBord';
import redirect from '~/modules/pronote/service/redirect';

export interface CarnetDeBordDetailsScreenDataProps {
  session: IUserSession;
}

export interface CarnetDeBordDetailsScreenEventProps {}

export interface CarnetDeBordDetailsScreenNavigationParams {
  type: CarnetDeBordSection;
  data: ICarnetDeBord;
}

export type CarnetDeBordDetailsScreenProps = CarnetDeBordDetailsScreenDataProps &
  CarnetDeBordDetailsScreenEventProps &
  NavigationInjectedProps<CarnetDeBordDetailsScreenNavigationParams>;

function CarnetDeBordDetailsScreen(props: CarnetDeBordDetailsScreenProps) {
  const type = props.navigation.getParam('type');
  const data = props.navigation.getParam('data');
  const pageTitleComponent = React.useMemo(() => {
    const title = type && CarnetDeBordDetailsScreen.pageTiteI18n[type];
    return <HeaderTitleAndSubtitle title={I18n.t(title)} subtitle={I18n.t(`CarnetDeBord`)} />;
  }, [type]);
  const items = React.useMemo(() => {
    const itemArray = CarnetDeBordDetailsScreen.getItems(type, data);
    return itemArray?.map((item, index) => (
      <View
        key={index}
        style={[
          CarnetDeBordDetailsScreen.styles.section,
          index + 1 < itemArray.length ? CarnetDeBordDetailsScreen.styles.sectionWithBorder : {},
        ]}>
        <View style={CarnetDeBordDetailsScreen.styles.sectionLeft}>
          {item.title ? <SmallBoldText numberOfLines={1}>{item.title}</SmallBoldText> : null}
          {item.date ? (
            <CaptionBoldText
              style={[
                CarnetDeBordDetailsScreen.styles.textDate,
                item.label || item.description ? CarnetDeBordDetailsScreen.styles.textDateMargin : undefined,
              ]}
              numberOfLines={1}>
              {item.date}
            </CaptionBoldText>
          ) : null}
          {item.label ? <SmallBoldText numberOfLines={1}>{item.label}</SmallBoldText> : null}
          {item.description ? <SmallText numberOfLines={1}>{extractTextFromHtml(item.description)}</SmallText> : null}
        </View>
        {item.value ? (
          <SmallText numberOfLines={2} style={CarnetDeBordDetailsScreen.styles.sectionRight}>
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
    <PageView
      navigation={props.navigation}
      navBarWithBack={{
        title: pageTitleComponent,
      }}>
      <ScrollView alwaysBounceVertical={false}>
        {type === CarnetDeBordSection.NOTES && data.PageReleveDeNotes?.Message ? (
          <SmallText style={CarnetDeBordDetailsScreen.styles.message}>{data.PageReleveDeNotes.Message}</SmallText>
        ) : null}
        <CardWithoutPadding style={CarnetDeBordDetailsScreen.styles.card}>{items}</CardWithoutPadding>
        <ActionButton
          style={CarnetDeBordDetailsScreen.styles.button}
          type="secondary"
          action={() => {
            if (data.address) redirect(props.session, data.address, pageId);
          }}
          iconName="pictos-external-link"
          text={I18n.t('pronote.carnetDeBord.openInPronote')}
        />
      </ScrollView>
    </PageView>
  );
}
CarnetDeBordDetailsScreen.pageTiteI18n = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: 'pronote.carnetDeBord.cahierDeTextes.title',
  [CarnetDeBordSection.NOTES]: 'pronote.carnetDeBord.releveDeNotes.title',
  [CarnetDeBordSection.COMPETENCES]: 'pronote.carnetDeBord.competences.title',
  [CarnetDeBordSection.VIE_SCOLAIRE]: 'pronote.carnetDeBord.vieScolaire.title',
};
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
CarnetDeBordDetailsScreen.styles = StyleSheet.create({
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

export default connect(
  (state: IGlobalState) => ({
    session: getUserSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(CarnetDeBordDetailsScreen);
