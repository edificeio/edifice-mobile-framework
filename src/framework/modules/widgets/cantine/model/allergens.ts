import { I18n } from '~/app/i18n';

import type { MenuItem } from '.';

const ALLERGENS = [
  { key: 'allerg_gluten', labelI18n: 'widget-cantine-menu-allergene-gluten' },
  { key: 'allerg_crustace', labelI18n: 'widget-cantine-menu-allergene-crustace' },
  { key: 'allerg_oeuf', labelI18n: 'widget-cantine-menu-allergene-oeuf' },
  { key: 'allerg_poisson', labelI18n: 'widget-cantine-menu-allergene-poisson' },
  { key: 'allerg_soja', labelI18n: 'widget-cantine-menu-allergene-soja' },
  { key: 'allerg_lait', labelI18n: 'widget-cantine-menu-allergene-lait' },
  { key: 'allerg_fruit_coque', labelI18n: 'widget-cantine-menu-allergene-fruit-coque' },
  { key: 'allerg_celeri', labelI18n: 'widget-cantine-menu-allergene-celeri' },
  { key: 'allerg_moutarde', labelI18n: 'widget-cantine-menu-allergene-moutarde' },
  { key: 'allerg_sesame', labelI18n: 'widget-cantine-menu-allergene-sesame' },
  { key: 'allerg_anhydride', labelI18n: 'widget-cantine-menu-allergene-anhydride' },
  { key: 'allerg_lupin', labelI18n: 'widget-cantine-menu-allergene-lupin' },
  { key: 'allerg_mollusque', labelI18n: 'widget-cantine-menu-allergene-mollusque' },
  { key: 'allerg_arachide', labelI18n: 'widget-cantine-menu-allergene-arachide' },
] as const satisfies readonly { key: keyof MenuItem; labelI18n: string }[];

// any non-zero value means the dish contains the allergen.
export const hasAllergens = (item: MenuItem): boolean => ALLERGENS.some(allergen => item[allergen.key] !== 0);

export const formatAllergens = (item: MenuItem): string =>
  ALLERGENS.filter(allergen => item[allergen.key] !== 0)
    .map(allergen => I18n.get(allergen.labelI18n))
    .join(', ');
