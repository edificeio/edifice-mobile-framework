import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { MenuItem } from '../model';

import theme from '~/app/theme';
import AdaptiveTimeline from '~/framework/components/AdaptiveTimeline';
import { ContentCard } from '~/framework/components/card';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText, BodyText, SmallText } from '~/framework/components/text';
import { Image } from '~/framework/util/media';

const typeColors = {
  accompagnement: theme.palette.complementary.red.dark,
  dessert: theme.palette.complementary.red.dark,
  entree: theme.palette.complementary.red.dark,
  laitage: theme.palette.complementary.red.dark,
  plat: theme.palette.complementary.red.dark,
};

const styles = StyleSheet.create({
  allergyText: {
    fontSize: getScaleFontSize(12),
    fontStyle: 'italic',
    marginLeft: 4,
  },
  iconElement: {
    height: UI_SIZES.elements.icon.xsmall,
    marginLeft: 4,
    width: UI_SIZES.elements.icon.xsmall,
  },
  legendIcon: {
    height: UI_SIZES.elements.icon.xsmall,
    marginRight: UI_SIZES.spacing.tiny,
    width: UI_SIZES.elements.icon.xsmall,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
    width: '48%',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendText: {
    color: theme.palette.grey.black,
    flex: 1,
  },
  legendTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.minor,
    marginLeft: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  menuItemContainer: {
    marginTop: UI_SIZES.spacing.minor,
  },
  menuItemContent: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'column',
  },
  menuItemIcons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  menuItemName: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.minor,
  },
  menuItemNameText: {
    fontSize: getScaleFontSize(16),
  },
  menuItemText: {
    flex: 1,
  },
  menuItemType: {
    alignItems: 'center',
    backgroundColor: theme.palette.complementary.orange.pale,
    borderColor: theme.palette.complementary.orange.light,
    borderRadius: UI_SIZES.radius.small,
    borderWidth: 1,
    flexDirection: 'row',
    marginLeft: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: 2,
  },
  typeSection: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  typeSectionTitle: {
    marginBottom: UI_SIZES.spacing.tiny,
    textTransform: 'capitalize',
  },
  typeTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.tiny,
  },
  typeTitleDot: {
    borderRadius: 4,
    height: 8,
    marginRight: UI_SIZES.spacing.tiny,
    width: 8,
  },
});

interface MenuCardProps {
  menuItems: MenuItem[];
}

const getTypeLabel = (type: MenuItem['type']): string => {
  const typeLabels = {
    accompagnement: 'Accompagnement',
    dessert: 'Dessert',
    entree: 'Entrée',
    laitage: 'Laitage',
    plat: 'Plat',
  };
  return typeLabels[type] || type;
};

const getAllergyText = (item: MenuItem): string => {
  const allergyText: string[] = [];
  if (item.allerg_gluten !== 0) {
    allergyText.push('Gluten');
  }
  if (item.allerg_crustace !== 0) {
    allergyText.push('Crustacés');
  }
  if (item.allerg_oeuf !== 0) {
    allergyText.push('Oeufs');
  }
  if (item.allerg_poisson !== 0) {
    allergyText.push('Poisson');
  }
  if (item.allerg_soja !== 0) {
    allergyText.push('Soja');
  }
  if (item.allerg_lait !== 0) {
    allergyText.push('Lait');
  }
  if (item.allerg_fruit_coque !== 0) {
    allergyText.push('Fruit de coque');
  }
  if (item.allerg_celeri !== 0) {
    allergyText.push('Céleri');
  }
  if (item.allerg_moutarde !== 0) {
    allergyText.push('Moutarde');
  }
  if (item.allerg_sesame !== 0) {
    allergyText.push('Sésame');
  }
  if (item.allerg_anhydride !== 0) {
    allergyText.push('Anhydride');
  }
  if (item.allerg_lupin !== 0) {
    allergyText.push('Lupin');
  }
  if (item.allerg_mollusque !== 0) {
    allergyText.push('Mollusque');
  }
  if (item.allerg_arachide !== 0) {
    allergyText.push('Arachide');
  }
  return allergyText.join(', ');
};

const hasAllergy = (item: MenuItem) => {
  return (
    item.allerg_gluten !== 0 ||
    item.allerg_crustace !== 0 ||
    item.allerg_oeuf !== 0 ||
    item.allerg_poisson !== 0 ||
    item.allerg_soja !== 0 ||
    item.allerg_lait !== 0 ||
    item.allerg_fruit_coque !== 0 ||
    item.allerg_celeri !== 0 ||
    item.allerg_moutarde !== 0 ||
    item.allerg_sesame !== 0 ||
    item.allerg_anhydride !== 0 ||
    item.allerg_lupin !== 0 ||
    item.allerg_mollusque !== 0 ||
    item.allerg_arachide !== 0
  );
};
const MenuItemComponent: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemName}>
          <View style={styles.menuItemText}>
            <BodyText style={styles.menuItemNameText}>
              {item.nom.charAt(0).toUpperCase() + item.nom.slice(1).toLowerCase()}
            </BodyText>
          </View>
          <View style={styles.menuItemIcons}>
            {item.bio && <Image source={require('ASSETS/images/cantine/bio-logo.png')} style={styles.iconElement} />}
            {item.vegetarien && <Image source={require('ASSETS/images/cantine/vegetarien-logo.png')} style={styles.iconElement} />}
            {item.faitmaison && <Image source={require('ASSETS/images/cantine/fait-maison-logo.png')} style={styles.iconElement} />}
            {item.local && <Image source={require('ASSETS/images/cantine/produit-local-logo.png')} style={styles.iconElement} />}
          </View>
        </View>
        {hasAllergy(item) && (
          <View style={styles.menuItemType}>
            <Svg
              name="ui-alert-triangle"
              fill={theme.palette.complementary.orange.regular}
              height={UI_SIZES.elements.icon.xsmall}
              width={UI_SIZES.elements.icon.xsmall}
            />
            <SmallText style={styles.allergyText}>Allergènes: {getAllergyText(item)}</SmallText>
          </View>
        )}
      </View>
    </View>
  );
};

export const MenuCard: React.FC<MenuCardProps> = ({ menuItems }) => {
  // Group menu items by type for better organization
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
    <ContentCard
      footer={
        <View>
          <BodyBoldText style={styles.legendTitle}>Légende</BodyBoldText>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <Image source={require('ASSETS/images/cantine/bio-logo.png')} style={styles.legendIcon} />
              <SmallText style={styles.legendText}>Bio</SmallText>
            </View>
            <View style={styles.legendItem}>
              <Image source={require('ASSETS/images/cantine/vegetarien-logo.png')} style={styles.legendIcon} />
              <SmallText style={styles.legendText}>Végétarien</SmallText>
            </View>
            <View style={styles.legendItem}>
              <Image source={require('ASSETS/images/cantine/fait-maison-logo.png')} style={styles.legendIcon} />
              <SmallText style={styles.legendText}>Fait maison</SmallText>
            </View>
            <View style={styles.legendItem}>
              <Image source={require('ASSETS/images/cantine/produit-local-logo.png')} style={styles.legendIcon} />
              <SmallText style={styles.legendText}>Produit local</SmallText>
            </View>
          </View>
        </View>
      }>
      <View style={styles.menuItemContainer}>
        {typeOrder.map(type => {
          const items = groupedItems[type];
          if (!items || items.length === 0) return null;

          return (
            <View key={type} style={styles.typeSection}>
              <View style={styles.typeTitleContainer}>
                <View style={[styles.typeTitleDot, { backgroundColor: typeColors[type] }]} />
                <BodyBoldText style={[styles.typeSectionTitle, { color: typeColors[type] }]}>{getTypeLabel(type)}</BodyBoldText>
              </View>
              <AdaptiveTimeline
                topPosition={UI_SIZES.spacing.large}
                color={typeColors[type]}
                leftPosition={UI_SIZES.spacing.tiny}
                height="80%"
              />
              {items.map((item, index) => (
                <MenuItemComponent key={`${item.id}-${index}`} item={item} />
              ))}
            </View>
          );
        })}
      </View>
    </ContentCard>
  );
};
