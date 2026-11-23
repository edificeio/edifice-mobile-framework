/**
 * Demo data for the cantine widget (AO demo), in the format returned by
 * `/appregistry/:structureId/cantine/menu?date=`.
 *
 * Same menus as the web homepage demo (entcore `timeline/frontend`, `CantineDemo`):
 * three lunch menus of a collège served in turn, today's being the first one.
 * No dinner service.
 */
import { CantineData, MenuItem } from '~/framework/modules/widgets/cantine/model';

type Allergen =
  | 'gluten'
  | 'crustace'
  | 'oeuf'
  | 'poisson'
  | 'soja'
  | 'lait'
  | 'fruit_coque'
  | 'celeri'
  | 'moutarde'
  | 'sesame'
  | 'anhydride'
  | 'lupin'
  | 'mollusque'
  | 'arachide';

interface DemoDish {
  label: string;
  type: MenuItem['type'];
  bio?: boolean;
  faitmaison?: boolean;
  local?: boolean;
  vegetarien?: boolean;
  allergens?: Allergen[];
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Menus served in turn, one per day. */
const MENUS: DemoDish[][] = [
  [
    { allergens: ['moutarde'], bio: true, label: 'Carottes râpées vinaigrette', type: 'entree', vegetarien: true },
    { label: 'Salade de betteraves', type: 'entree', vegetarien: true },
    { allergens: ['lait'], faitmaison: true, label: 'Sauté de poulet au curry', local: true, type: 'plat' },
    { bio: true, label: 'Riz pilaf', type: 'accompagnement', vegetarien: true },
    { label: 'Haricots verts persillés', local: true, type: 'accompagnement', vegetarien: true },
    { allergens: ['lait'], bio: true, label: 'Yaourt nature', local: true, type: 'laitage' },
    { label: 'Pomme des vergers de Flandre', local: true, type: 'dessert', vegetarien: true },
  ],
  [
    { allergens: ['celeri'], faitmaison: true, label: 'Potage de légumes', local: true, type: 'entree', vegetarien: true },
    { allergens: ['gluten', 'lait', 'oeuf'], faitmaison: true, label: 'Lasagnes à la bolognaise', type: 'plat' },
    {
      allergens: ['gluten', 'lait', 'oeuf'],
      faitmaison: true,
      label: 'Lasagnes aux légumes du soleil',
      type: 'plat',
      vegetarien: true,
    },
    { bio: true, label: 'Salade verte', type: 'accompagnement', vegetarien: true },
    { allergens: ['lait'], label: 'Emmental', type: 'laitage' },
    { allergens: ['lait'], label: 'Maroilles', local: true, type: 'laitage' },
    { bio: true, faitmaison: true, label: 'Compote pomme-poire', type: 'dessert', vegetarien: true },
  ],
  [
    { allergens: ['lait'], bio: true, label: 'Concombre à la crème', type: 'entree', vegetarien: true },
    { allergens: ['poisson', 'lait'], label: 'Filet de colin sauce citron', type: 'plat' },
    { label: 'Pommes de terre vapeur', local: true, type: 'accompagnement', vegetarien: true },
    { allergens: ['lait'], label: 'Fromage blanc', type: 'laitage' },
    { allergens: ['gluten', 'oeuf', 'lait'], faitmaison: true, label: 'Gâteau au chocolat', type: 'dessert', vegetarien: true },
  ],
];

const toMenuItem = (dish: DemoDish, id: number, order: number): MenuItem => {
  const allergens = dish.allergens ?? [];
  const has = (allergen: Allergen) => (allergens.includes(allergen) ? 1 : 0);
  return {
    Agrimer_FL: 0,
    Agrimer_LAIT: 0,
    Conseille: 0,
    aNoter: 0,
    allerg_anhydride: has('anhydride'),
    allerg_arachide: has('arachide'),
    allerg_celeri: has('celeri'),
    allerg_crustace: has('crustace'),
    allerg_fruit_coque: has('fruit_coque'),
    allerg_gluten: has('gluten'),
    allerg_lait: has('lait'),
    allerg_lupin: has('lupin'),
    allerg_mollusque: has('mollusque'),
    allerg_moutarde: has('moutarde'),
    allerg_oeuf: has('oeuf'),
    allerg_poisson: has('poisson'),
    allerg_sesame: has('sesame'),
    allerg_soja: has('soja'),
    bio: dish.bio ?? false,
    composanteId: id,
    designationMenu: dish.label,
    faitmaison: dish.faitmaison ?? false,
    id,
    jourDeFonctionnement: 1,
    local: dish.local ?? false,
    nom: dish.label,
    ordre: String(order),
    quantiteprevue: 0,
    type: dish.type,
    vegetarien: dish.vegetarien ?? false,
  };
};

/** Days between `date` ("YYYY-MM-DD") and today, negative in the past. */
const dayOffsetOf = (date: string): number => {
  const [year, month, day] = date.split('-').map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(year, month - 1, day) - today) / DAY_IN_MS);
};

/** Menu of the given day ("YYYY-MM-DD"), as `/appregistry/:structureId/cantine/menu` returns it. */
export function getDemoCantineData(date: string): CantineData {
  const offset = dayOffsetOf(date);
  const menuIndex = Number.isNaN(offset) ? 0 : ((offset % MENUS.length) + MENUS.length) % MENUS.length;
  return {
    dinnerAvailable: false,
    menu: MENUS[menuIndex].map((dish, index) => toMenuItem(dish, menuIndex * 100 + index + 1, index + 1)),
  };
}
