import * as React from 'react';
import { Pressable, View } from 'react-native';

import styles from './styles';
import { MenuCardProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText, SmallBoldText, SmallText } from '~/framework/components/text';
import { MenuItem } from '~/framework/modules/widgets/cantine/model';
import { Image } from '~/framework/util/media-deprecated';

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

// Helper function to capitalize first letter
const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Icon configuration for menu items
const MENU_ICONS = {
  bio: require('ASSETS/images/cantine/bio-logo.png'),
  faitmaison: require('ASSETS/images/cantine/fait-maison-logo.png'),
  local: require('ASSETS/images/cantine/produit-local-logo.png'),
  vegetarien: require('ASSETS/images/cantine/vegetarien-logo.png'),
} as const;

// Color configuration for different menu types
const MENU_TYPE_COLORS = {
  accompagnement: theme.palette.complementary.blue.regular,
  dessert: theme.palette.complementary.yellow.regular,
  entree: theme.palette.complementary.red.regular,
  laitage: theme.palette.complementary.pink.regular,
  plat: theme.palette.complementary.green.regular,
} as const;

// Menu section component with elegant restaurant styling and colored left bar
const MenuSection: React.FC<{
  items: MenuItem[];
  title: string;
  type: MenuItem['type'];
}> = React.memo(({ items, title, type }) => {
  const sectionColor = MENU_TYPE_COLORS[type] || theme.palette.primary.regular;
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  return (
    <View style={styles.menuSection}>
      <View>
        <View style={styles.sectionTitleContainer}>
          <View style={[styles.titleDot, { backgroundColor: sectionColor }]} />
          <BodyBoldText style={styles.sectionTitle}>{title}</BodyBoldText>
        </View>
      </View>

      <View style={[styles.menuItemsContainer, { borderLeftColor: sectionColor }]}>
        {items.map((item, index) => {
          // Get active icons for this item
          const activeIcons = [
            { condition: item.bio, key: 'bio', source: MENU_ICONS.bio },
            { condition: item.vegetarien, key: 'vegetarien', source: MENU_ICONS.vegetarien },
            { condition: item.faitmaison, key: 'faitmaison', source: MENU_ICONS.faitmaison },
            { condition: item.local, key: 'local', source: MENU_ICONS.local },
          ].filter(icon => icon.condition);

          const isExpanded = expandedItems.has(String(item.id));
          const hasAllergies = hasAllergy(item);
          const isLastItem = index === items.length - 1;

          return (
            <Pressable
              key={`${item.id}-${index}`}
              style={isLastItem ? styles.menuItemLast : styles.menuItem}
              disabled={!hasAllergies}
              onPress={() => hasAllergies && toggleExpanded(String(item.id))}>
              <View style={styles.menuItemHeader}>
                <View style={styles.menuItemNameContainer}>
                  <BodyText style={styles.menuItemName}>{capitalizeFirstLetter(item.nom)}</BodyText>
                </View>
                <View style={styles.menuItemRightContainer}>
                  {activeIcons.length > 0 && (
                    <View style={styles.menuItemIcons}>
                      {activeIcons.map(({ key, source }) => (
                        <Image key={key} source={source} style={styles.menuItemIcon} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
              {hasAllergies && (
                <View>
                  <View style={styles.allergyHeader}>
                    <View style={styles.allergyHeaderLeft}>
                      <Svg
                        name="ui-alert-triangle"
                        fill={theme.palette.grey.graphite}
                        height={UI_SIZES.elements.icon.xsmall}
                        width={UI_SIZES.elements.icon.xsmall}
                      />
                      <SmallText style={styles.allergyText}>Allérgenes</SmallText>
                    </View>
                    <View style={styles.allergyHeaderRight}>
                      <Svg
                        name={isExpanded ? 'ui-rafterUp' : 'ui-rafterDown'}
                        fill={theme.palette.grey.graphite}
                        height={UI_SIZES.elements.icon.xsmall}
                        width={UI_SIZES.elements.icon.xsmall}
                      />
                    </View>
                  </View>
                  <View>{isExpanded && <SmallText style={styles.allergyExpandedText}>{getAllergyText(item)}</SmallText>}</View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

// Legend component for menu icons
const MenuLegend: React.FC = React.memo(() => (
  <View style={styles.legendContainer}>
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

      {/* Allergen legend item */}
      <View style={styles.legendItem}>
        <View style={styles.legendAllergenIcon}>
          <Svg
            name="ui-alert-triangle"
            fill={theme.palette.grey.graphite}
            height={UI_SIZES.elements.icon.xsmall}
            width={UI_SIZES.elements.icon.xsmall}
          />
        </View>
        <SmallText style={styles.legendText}>{I18n.get('widget-cantine-menu-allergenes-label')}</SmallText>
      </View>
    </View>
    <SmallBoldText style={styles.legendText}>{'* ' + I18n.get('widget-cantine-menu-footer')}</SmallBoldText>
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

  // Check if any items have allergies

  return (
    <View style={styles.container}>
      {/* Menu sections */}
      <View style={styles.menuContainer}>
        {groupedItems.entree && groupedItems.entree.length > 0 && (
          <MenuSection items={groupedItems.entree} title={`${I18n.get('widget-cantine-menu-type-entree')}`} type="entree" />
        )}

        {groupedItems.plat && groupedItems.plat.length > 0 && (
          <MenuSection items={groupedItems.plat} title={`${I18n.get('widget-cantine-menu-type-plat')}`} type="plat" />
        )}

        {groupedItems.accompagnement && groupedItems.accompagnement.length > 0 && (
          <MenuSection
            items={groupedItems.accompagnement}
            title={`${I18n.get('widget-cantine-menu-type-accompagnement')}`}
            type="accompagnement"
          />
        )}

        {groupedItems.laitage && groupedItems.laitage.length > 0 && (
          <MenuSection items={groupedItems.laitage} title={`${I18n.get('widget-cantine-menu-type-laitage')}`} type="laitage" />
        )}

        {groupedItems.dessert && groupedItems.dessert.length > 0 && (
          <MenuSection items={groupedItems.dessert} title={`${I18n.get('widget-cantine-menu-type-dessert')}`} type="dessert" />
        )}
      </View>

      {/* Legend */}
      <MenuLegend />
    </View>
  );
}
