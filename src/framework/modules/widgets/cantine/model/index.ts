/**
 * Data model for the module cantine
 */

// [SCAFFOLDER] In this file, export your data model and functions associated.

export interface MenuItem {
  jourDeFonctionnement: number;
  nom: string;
  id: number;
  composanteId: number;
  type: 'entree' | 'plat' | 'accompagnement' | 'laitage' | 'dessert';
  designationMenu: string;
  ordre: string;
  bio: boolean;
  local: boolean;
  faitmaison: boolean;
  vegetarien: boolean;
  allerg_gluten: number;
  allerg_crustace: number;
  allerg_oeuf: number;
  allerg_poisson: number;
  allerg_soja: number;
  allerg_lait: number;
  allerg_fruit_coque: number;
  allerg_celeri: number;
  allerg_moutarde: number;
  allerg_sesame: number;
  allerg_anhydride: number;
  allerg_lupin: number;
  allerg_mollusque: number;
  allerg_arachide: number;
  quantiteprevue: number;
  Conseille: number;
  aNoter: number;
  Agrimer_FL: number;
  Agrimer_LAIT: number;
}

export interface CantineData {
  menu: MenuItem[];
}
