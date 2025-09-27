import * as React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { MenuCardProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AdaptiveTimeline from '~/framework/components/AdaptiveTimeline';
import { ContentCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText, SmallText } from '~/framework/components/text';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { Image } from '~/framework/util/media';

const getTypeLabel = (type: MenuItem['type']): string => {
  const typeLabels = {
    accompagnement: I18n.get('widget-cantine-menu-type-accompagnement'),
    dessert: I18n.get('widget-cantine-menu-type-dessert'),
    entree: I18n.get('widget-cantine-menu-type-entree'),
    laitage: I18n.get('widget-cantine-menu-type-laitage'),
    plat: I18n.get('widget-cantine-menu-type-plat'),
  };
  return typeLabels[type] || type;
};

// Allergy configuration
const ALLERGY_CONFIG = [
  { key: 'allerg_gluten', label: 'widget-cantine-menu-allergene-gluten' },
  { key: 'allerg_crustace', label: 'widget-cantine-menu-allergene-crustace' },
  { key: 'allerg_oeuf', label: 'widget-cantine-menu-allergene-oeuf' },
  { key: 'allerg_poisson', label: 'widget-cantine-menu-allergene-poisson' },
  { key: 'allerg_soja', label: 'widget-cantine-menu-allergene-soja' },
  { key: 'allerg_lait', label: 'widget-cantine-menu-allergene-lait' },
  { key: 'allerg_fruit_coque', label: 'widget-cantine-menu-allergene-fruit-coque' },
  { key: 'allerg_celeri', label: 'widget-cantine-menu-allergene-celeri' },
  { key: 'allerg_moutarde', label: 'widget-cantine-menu-allergene-moutarde' },
  { key: 'allerg_sesame', label: 'widget-cantine-menu-allergene-sesame' },
  { key: 'allerg_anhydride', label: 'widget-cantine-menu-allergene-anhydride' },
  { key: 'allerg_lupin', label: 'widget-cantine-menu-allergene-lupin' },
  { key: 'allerg_mollusque', label: 'widget-cantine-menu-allergene-mollusque' },
  { key: 'allerg_arachide', label: 'widget-cantine-menu-allergene-arachide' },
] as const;

const getAllergyText = (item: MenuItem): string => {
  const allergies = ALLERGY_CONFIG.filter(allergy => item[allergy.key as keyof MenuItem] !== 0).map(allergy =>
    I18n.get(allergy.label),
  );
  return allergies.join(', ');
};

const hasAllergy = (item: MenuItem): boolean => {
  return ALLERGY_CONFIG.some(allergy => item[allergy.key as keyof MenuItem] !== 0);
};
// Constants for better maintainability
const MENU_ITEM_HEIGHT = {
  BASE: UI_SIZES.spacing.minor + UI_SIZES.elements.icon.xsmall + UI_SIZES.spacing.tiny * 2,
  WITH_ALLERGY: UI_SIZES.elements.icon.xsmall + UI_SIZES.spacing.tiny * 2 + 4,
} as const;

// Helper function to capitalize first letter
const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Simplified height calculation
const calculateTimelineHeight = (items: MenuItem[]): number => {
  return items.reduce((totalHeight, item) => {
    const baseHeight = MENU_ITEM_HEIGHT.BASE;
    const allergyHeight = hasAllergy(item) ? MENU_ITEM_HEIGHT.WITH_ALLERGY : 0;
    return totalHeight + baseHeight + allergyHeight;
  }, 0);
};

// Icon configuration for menu items
const MENU_ICONS = {
  bio: require('ASSETS/images/cantine/bio-logo.png'),
  faitmaison: require('ASSETS/images/cantine/fait-maison-logo.png'),
  local: require('ASSETS/images/cantine/produit-local-logo.png'),
  vegetarien: require('ASSETS/images/cantine/vegetarien-logo.png'),
} as const;

// Simplified menu item component that combines all functionality
const MenuItemComponent: React.FC<{ item: MenuItem }> = React.memo(({ item }) => {
  // Get active icons for this item
  const activeIcons = [
    { condition: item.bio, key: 'bio', source: MENU_ICONS.bio },
    { condition: item.vegetarien, key: 'vegetarien', source: MENU_ICONS.vegetarien },
    { condition: item.faitmaison, key: 'faitmaison', source: MENU_ICONS.faitmaison },
    { condition: item.local, key: 'local', source: MENU_ICONS.local },
  ].filter(icon => icon.condition);

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemName}>
          <View style={styles.menuItemText}>
            <BodyText style={styles.menuItemNameText}>{capitalizeFirstLetter(item.nom)}</BodyText>
          </View>
          {activeIcons.length > 0 && (
            <View style={styles.menuItemIcons}>
              {activeIcons.map(({ key, source }) => (
                <Image key={key} source={source} style={styles.iconElement} />
              ))}
            </View>
          )}
        </View>
        {hasAllergy(item) && (
          <View style={styles.menuItemType}>
            <Svg
              name="ui-alert-triangle"
              fill={theme.palette.complementary.orange.regular}
              height={UI_SIZES.elements.icon.xsmall}
              width={UI_SIZES.elements.icon.xsmall}
            />
            <SmallText style={styles.allergyText}>
              {I18n.get('widget-cantine-menu-allergenes-label')} {getAllergyText(item)}
            </SmallText>
          </View>
        )}
      </View>
    </View>
  );
});

// Legend component for better organization
const MenuLegend: React.FC = React.memo(() => (
  <View>
    <BodyBoldText style={styles.legendTitle}>{I18n.get('widget-cantine-menu-legend-title')}</BodyBoldText>
    <View style={styles.legendItems}>
      {[
        { icon: MENU_ICONS.bio, key: 'bio', label: 'widget-cantine-menu-legend-bio' },
        { icon: MENU_ICONS.vegetarien, key: 'vegetarien', label: 'widget-cantine-menu-legend-vegetarien' },
        { icon: MENU_ICONS.faitmaison, key: 'faitmaison', label: 'widget-cantine-menu-legend-fait-maison' },
        { icon: MENU_ICONS.local, key: 'local', label: 'widget-cantine-menu-legend-produit-local' },
      ].map(({ icon, key, label }) => (
        <View key={key} style={styles.legendItem}>
          <Image source={icon} style={styles.legendIcon} />
          <SmallText style={styles.legendText}>{I18n.get(label)}</SmallText>
        </View>
      ))}
    </View>
  </View>
));

// Menu section component
const MenuSection: React.FC<{ items: MenuItem[]; type: MenuItem['type'] }> = React.memo(({ items, type }) => (
  <View style={styles.typeSection}>
    <View style={styles.typeTitleContainer}>
      <BodyBoldText style={styles.typeSectionTitle}>{getTypeLabel(type)}</BodyBoldText>
    </View>
    {items.map((item, index) => (
      <MenuItemComponent key={`${item.id}-${index}`} item={item} />
    ))}
    <AdaptiveTimeline
      topPosition={UI_SIZES.spacing.big}
      color={theme.palette.primary.regular}
      leftPosition={UI_SIZES.spacing.tiny}
      height={calculateTimelineHeight(items)}
    />
  </View>
));

export default function MenuCard(props: MenuCardProps) {
  const { menuItems } = props;

  // Group menu items by type
  const groupedItems = menuItems?.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    },
    {} as Record<MenuItem['type'], MenuItem[]>,
  );

  const typeOrder: MenuItem['type'][] = ['entree', 'plat', 'accompagnement', 'laitage', 'dessert'];

  return (
    <ContentCard footer={<MenuLegend />}>
      <View style={styles.menuItemContainer}>
        {typeOrder.map(type => {
          const items = groupedItems[type];
          if (!items || items.length === 0) return null;
          return <MenuSection key={type} items={items} type={type} />;
        })}
      </View>
    </ContentCard>
  );
}
