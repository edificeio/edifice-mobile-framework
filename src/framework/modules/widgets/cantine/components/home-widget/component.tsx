import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { NavigationProp, ParamListBase, useFocusEffect, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { SecondaryButton } from '~/framework/components/buttons/secondary';
import { BodyText } from '~/framework/components/text';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { MenuSteps } from '~/framework/modules/widgets/cantine/components/menu';
import { CantineWidgetPlaceholder } from '~/framework/modules/widgets/cantine/components/menu/steps/placeholder';
import { useCantineMenu } from '~/framework/modules/widgets/cantine/hooks/menu';
import { cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { getSelectedStructure } from '~/framework/modules/widgets/cantine/storage';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { CANTINE_WIDGET_MENU_MAX_HEIGHT } from '~/framework/modules/widgets/components/constants';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';

import styles from './styles';

export interface CantineWidgetProps {
  session: AuthActiveAccount;
}

export function CantineWidget({ session }: Readonly<CantineWidgetProps>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [isMenuCut, setIsMenuCut] = React.useState<boolean>(false);

  const [structure, setStructure] = React.useState(() => getSelectedStructure(session.user.structures));

  useFocusEffect(React.useCallback(() => setStructure(getSelectedStructure(session.user.structures)), [session.user.structures]));

  const { error, load, loading, menu } = useCantineMenu(session.user.id, structure?.UAI);

  const forceReload = React.useCallback(() => load(true), [load]);
  useHomeReload(forceReload);

  const onOpenCard = React.useCallback(() => navigation.navigate(cantineRouteNames.home), [navigation]);

  // menu keeps its full height inside the clipped box, which tells whether its end is hidden.
  const onMenuLayout = React.useCallback(
    (event: LayoutChangeEvent) => setIsMenuCut(event.nativeEvent.layout.height > CANTINE_WIDGET_MENU_MAX_HEIGHT),
    [],
  );

  if (!structure) return null;

  const renderStructureName = () => (
    <BodyText numberOfLines={1} style={styles.structureName}>
      {structure.name}
    </BodyText>
  );

  const renderLoading = () => (
    <>
      {renderStructureName()}
      <CantineWidgetPlaceholder />
    </>
  );

  const renderError = () => <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-error-text')} />;

  const renderEmpty = () => (
    <>
      {renderStructureName()}
      <WidgetMessage illustration="illu-error" text={I18n.get('widget-cantine-widget-empty-text')} />
    </>
  );

  const renderLoadedContent = () => (
    <>
      {renderStructureName()}
      <View style={styles.menu}>
        <View onLayout={onMenuLayout}>
          <MenuSteps menuItems={menu} />
        </View>
        {isMenuCut ? <View style={styles.fade} /> : null}
      </View>
    </>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (!menu.length) return renderEmpty();
    return renderLoadedContent();
  };

  return (
    <WidgetCard title={I18n.get('widget-cantine-widget-title')} onExpand={onOpenCard} expandTestID="cantine-widget-open">
      {renderContent()}
      {!error ? (
        <SecondaryButton
          text={I18n.get('widget-cantine-widget-seemore')}
          iconRight="ui-fullScreen"
          action={onOpenCard}
          style={styles.seeMore}
          testID="cantine-widget-see-more"
        />
      ) : null}
    </WidgetCard>
  );
}
