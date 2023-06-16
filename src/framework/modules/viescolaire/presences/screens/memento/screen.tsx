import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import { IMemento } from '~/framework/modules/viescolaire/presences/model';
import { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import { presencesService } from '~/framework/modules/viescolaire/presences/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { PresencesMementoScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.memento>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('presences-memento-title'),
  }),
});

const PresencesMementoScreen = (props: PresencesMementoScreenPrivateProps) => {
  const [memento, setMemento] = React.useState<IMemento | undefined>();
  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState || AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchMemento = async () => {
    try {
      const { session } = props;
      const { studentId } = props.route.params;

      if (!session) throw new Error();
      const newMemento = await presencesService.memento.get(session, studentId);
      setMemento(newMemento);
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchMemento()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchMemento()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderMemento = () => {
    return memento ? (
      <ScrollView>
        <View style={styles.studentInfos}>
          <BodyBoldText style={styles.studentName}>{memento.name}</BodyBoldText>
          <View style={styles.infoLine}>
            <Icon style={styles.iconDisplay} size={20} name="cake-variant" />
            <SmallText>
              {memento.birthDate ? I18n.get('presences-memento-birthdate', { date: memento.birthDate.format('L') }) : '-'}
            </SmallText>
          </View>
          <View style={styles.infoLine}>
            <Icon style={styles.iconDisplay} size={20} name="school" />
            <SmallText>{memento.classes.length ? memento.classes.join(', ') : '-'}</SmallText>
          </View>
          {memento.groups.length ? <SmallText style={styles.studentGroups}>{memento.groups.join(', ')}</SmallText> : null}
          <View style={styles.infoLine}>
            <Icon style={styles.iconDisplay} size={20} name="silverware" />
            <SmallText>{memento.accommodation ? memento.accommodation.toLocaleLowerCase() : '-'}</SmallText>
          </View>
        </View>
        {memento.relatives.length ? (
          <View style={[styles.relativesInfos, styles.shadow]}>
            <SmallText style={styles.relativesTitleText}>{I18n.get('presences-memento-relatives')}</SmallText>
            {memento.relatives.map(relative => (
              <View style={styles.relativesContainer}>
                <SmallBoldText style={styles.relativesIdentity}>
                  {relative.title ? relative.title + ' ' + relative.name : relative.name}
                </SmallBoldText>
                <View style={styles.infoLine}>
                  <Icon style={styles.iconDisplay} size={20} name="email" />
                  <SmallText>{relative.email ?? '-'}</SmallText>
                </View>
                <View style={styles.infoLine}>
                  <Icon style={styles.iconDisplay} size={20} name="cellphone" />
                  <SmallText>{relative.mobile ?? '-'}</SmallText>
                </View>
                <View style={styles.infoLine}>
                  <Icon style={styles.iconDisplay} size={20} name="phone" />
                  <SmallText>{relative.phone ?? '-'}</SmallText>
                </View>
                <View style={styles.infoLine}>
                  <Icon style={styles.iconDisplay} size={20} name="home" />
                  <SmallText>{relative.address ?? '-'}</SmallText>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    ) : null;
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
        return renderMemento();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return <PageView>{renderPage()}</PageView>;
};

export default connect((state: IGlobalState) => {
  const session = getSession();

  return {
    initialLoadingState: AsyncPagedLoadingState.PRISTINE,
    session,
  };
})(PresencesMementoScreen);
