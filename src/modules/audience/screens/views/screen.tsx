import React from 'react';
import { ColorValue, View } from 'react-native';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { BodyText, HeadingMText } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { accountTypeInfos } from '~/framework/util/accountType';
import { loadViews } from '~/modules/audience/actions';
import type { AudienceReferer, AudienceViewer } from '~/modules/audience/model';
import { I18n } from '~/util/i18n';

import styles from './styles';

// A type, not an interface: the params of a route must be a `Record<string, unknown>`
type AudienceViewsScreenNavParams = {
  referer: AudienceReferer;
};

/** A counter of views. With a color (a profile), its icon is white on that color; without, black on grey. */
const ViewsItem = ({
  color,
  icon,
  label,
  last,
  nb,
}: {
  color?: ColorValue;
  icon: SvgIconName;
  label: string;
  last?: boolean;
  nb: number;
}) => (
  <View style={[styles.item, last && styles.lastItem]}>
    <View style={[styles.icon, color ? { backgroundColor: color } : styles.iconDefault]}>
      <Svg
        name={icon}
        fill={color ? theme.palette.grey.white : theme.palette.grey.black}
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
      />
    </View>
    <HeadingMText style={styles.nb}>{nb}</HeadingMText>
    <BodyText>{label}</BodyText>
  </View>
);

const AudienceViewsScreen = ({ route }: StaticScreenProps<AudienceViewsScreenNavParams>) => {
  const { module, resourceId, resourceType } = route.params.referer;

  const [nbViews, setNbViews] = React.useState<number>(0);
  const [nbUniqueViews, setNbUniqueViews] = React.useState<number>(0);
  const [viewsPerProfile, setViewsPerProfile] = React.useState<AudienceViewer[]>([]);

  const loadData = React.useCallback(async () => {
    try {
      const dt = await loadViews({ module, resourceId, resourceType });
      setNbViews(dt.viewsCounter);
      setNbUniqueViews(dt.uniqueViewsCounter);
      setViewsPerProfile(dt.uniqueViewsPerProfile);
    } catch (e) {
      console.error('[AudienceViewsScreen] error :', e);
      throw e;
    }
  }, [module, resourceId, resourceType]);

  const renderContent = React.useCallback(
    () => (
      <View style={styles.container}>
        <ViewsItem icon="ui-see" label={I18n.get('audience-views-views')} nb={nbViews} />
        <ViewsItem icon="ui-users" label={I18n.get('audience-views-uniqueviews')} nb={nbUniqueViews} />
        <View style={styles.subItems}>
          {viewsPerProfile.map((item, index) => (
            <ViewsItem
              key={item.profile}
              color={accountTypeInfos[item.profile].color.regular}
              icon={accountTypeInfos[item.profile].icon}
              label={accountTypeInfos[item.profile].text}
              last={index === viewsPerProfile.length - 1}
              nb={item.counter}
            />
          ))}
        </View>
      </View>
    ),
    [nbUniqueViews, nbViews, viewsPerProfile],
  );

  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderError={renderError} />;
};

const renderError = () => <EmptyConnectionScreen />;

export default defineModal({
  options: () => ({
    title: I18n.get('audience-views-title'),
  }),
  screen: AudienceViewsScreen,
});
