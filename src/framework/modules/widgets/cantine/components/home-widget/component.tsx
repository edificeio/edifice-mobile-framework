import * as React from 'react';
import { View } from 'react-native';

import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { SecondaryButton } from '~/framework/components/buttons/secondary';
import { BodyText } from '~/framework/components/text';
import { withSession } from '~/framework/modules/auth/util';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { MenuSteps, MenuStepsPlaceholder } from '~/framework/modules/widgets/cantine/components/menu';
import { useCantineMenu } from '~/framework/modules/widgets/cantine/hooks/menu';
import { useCantineStructure } from '~/framework/modules/widgets/cantine/hooks/structure';
import { cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { CANTINE_WIDGET_MENU_MAX_HEIGHT } from '~/framework/modules/widgets/components/constants';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';

import styles from './styles';

const CantineWidget = withSession(({ session }) => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  // a list renders nothing at 0 height, so it starts at the box height before knowing its content.
  const [menuHeight, setMenuHeight] = React.useState<number>(CANTINE_WIDGET_MENU_MAX_HEIGHT);

  const { structure } = useCantineStructure(session.user.structures);
  const { isError, isLoading, loadMenu, lunchItems } = useCantineMenu(structure?.UAI);

  const forceReload = React.useCallback(() => loadMenu(true), [loadMenu]);
  useHomeReload(forceReload);

  const onOpenCard = React.useCallback(() => navigation.navigate(cantineRouteNames.home), [navigation]);

  // a list does not grow with its content, so it gets the height of its steps, cut at the box height.
  const onMenuContentSizeChange = React.useCallback((_width: number, height: number) => setMenuHeight(height), []);
  const isMenuCut = menuHeight > CANTINE_WIDGET_MENU_MAX_HEIGHT;

  if (!structure) return null;

  const renderStructureName = () => (
    <BodyText numberOfLines={1} style={styles.structureName}>
      {structure.name}
    </BodyText>
  );

  const renderLoading = () => (
    <>
      {renderStructureName()}
      <MenuStepsPlaceholder style={styles.placeholder} />
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
        <MenuSteps
          menuItems={lunchItems}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={onMenuContentSizeChange}
          style={[styles.menuList, { height: Math.min(menuHeight, CANTINE_WIDGET_MENU_MAX_HEIGHT) }]}
        />
        {isMenuCut ? <View style={styles.fade} /> : null}
      </View>
    </>
  );

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (isError) return renderError();
    if (!lunchItems.length) return renderEmpty();
    return renderLoadedContent();
  };

  return (
    <WidgetCard title={I18n.get('widget-cantine-widget-title')} onExpand={onOpenCard} expandTestID="cantine-widget-open">
      {renderContent()}
      {!isError ? (
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
});

export default CantineWidget;
