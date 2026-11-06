import type { Translate } from '~/modules/myapps/model';

import { getAppColor, getAppIcon, getAppLabel, getHelpUrl, getModuleLabel, hasHelpUrl, normalizeIconName } from './display';

const translations: Record<string, string> = {
  'myapps-app-blog': 'Blog',
  'myapps-app-cahier': 'Cahier multimédia',
  'some.key': 'Clé traduite',
};
const translate: Translate = key => translations[key] ?? key;

describe('getAppLabel', () => {
  it('1. translates the prefix', () => {
    expect(getAppLabel({ displayName: 'other', name: 'Blog', prefix: '/blog' }, translate)).toBe('Blog');
  });

  it('2. then the normalized displayName', () => {
    expect(getAppLabel({ displayName: 'Cahier', name: 'X', prefix: '/unknown' }, translate)).toBe('Cahier multimédia');
  });

  it('3. then the displayName as a key, or as it is', () => {
    expect(getAppLabel({ displayName: 'some.key', name: 'X', prefix: '' }, translate)).toBe('Clé traduite');
    expect(getAppLabel({ displayName: 'Untranslated', name: 'X' }, translate)).toBe('Untranslated');
  });

  it('4. then the name', () => {
    expect(getAppLabel({ displayName: '', name: 'X' }, translate)).toBe('X');
    expect(getAppLabel({ displayName: null, name: 'X', prefix: null }, translate)).toBe('X');
  });
});

describe('normalizeIconName', () => {
  it('drops the -large suffix, the case and the accents', () => {
    expect(normalizeIconName('Écoles-large')).toBe('ecoles');
    expect(normalizeIconName('large-icon')).toBe('large-icon');
  });
});

describe('getAppIcon', () => {
  it('1. is set by the name of some apps', () => {
    expect(getAppIcon({ icon: 'whatever', name: 'Directory' })).toBe('userbook');
  });

  it('2. is the icon of the server, normalized', () => {
    expect(getAppIcon({ icon: 'blog-large', name: 'Blog' })).toBe('blog');
    expect(getAppIcon({ icon: null, name: 'Blog' })).toBe('');
  });

  it('3. is renamed for some icons', () => {
    expect(getAppIcon({ icon: 'viescolaire-large', name: 'Vie scolaire' })).toBe('parametrage');
  });
});

describe('getAppColor', () => {
  it('1. is set by the name of some apps', () => {
    expect(getAppColor('Directory', 'red')).toBe('green');
    expect(getAppColor('Directory', undefined)).toBe('green');
  });

  it('2. is the color of the config', () => {
    expect(getAppColor('Blog', 'orange')).toBe('orange');
  });

  it('3. is none without color, or with one the palette does not have', () => {
    expect(getAppColor('Blog', undefined)).toBeUndefined();
    expect(getAppColor('Blog', '')).toBeUndefined();
    expect(getAppColor('Blog', 'not-a-color')).toBeUndefined();
    expect(getAppColor('Blog', 'toString')).toBeUndefined();
  });

  it('2. may be the primary or the secondary color', () => {
    expect(getAppColor('Blog', 'primary')).toBe('primary');
  });
});

describe('help', () => {
  const helpUrls = { 'en': 'https://en', 'fr': 'https://fr', 'pt-BR': 'https://pt-br' };

  it('has a link if one is set', () => {
    expect(hasHelpUrl({})).toBe(false);
    expect(hasHelpUrl({ fr: '' })).toBe(false);
    expect(hasHelpUrl({ fr: 'https://fr' })).toBe(true);
  });

  it('takes the language, then the base language, then French', () => {
    expect(getHelpUrl(helpUrls, 'pt-BR')).toBe('https://pt-br');
    expect(getHelpUrl(helpUrls, 'en-GB')).toBe('https://en');
    expect(getHelpUrl(helpUrls, 'es')).toBe('https://fr');
    expect(getHelpUrl({ es: 'https://es' }, 'de')).toBeUndefined();
    expect(getHelpUrl({}, 'fr')).toBeUndefined();
  });
});

describe('getModuleLabel', () => {
  const moduleTranslate: Translate = key => ({ 'myapps-app-Blog': 'Blog (i18n)', 'myapps-app-portal': 'Mes applis' })[key] ?? key;

  it('is the label of the app of the module', () => {
    expect(getModuleLabel({ matchEntcoreApp: 'Blog', name: 'blog' }, { label: 'Blog (server)' }, moduleTranslate)).toBe(
      'Blog (server)',
    );
  });

  it('else the translation of the app name, then of the module name and its aliases', () => {
    expect(getModuleLabel({ matchEntcoreApp: 'Blog', name: 'blog' }, undefined, moduleTranslate)).toBe('Blog (i18n)');
    expect(getModuleLabel({ name: 'myapps' }, undefined, moduleTranslate)).toBe('Mes applis');
  });

  it('else the module name', () => {
    expect(getModuleLabel({ name: 'other' }, undefined, moduleTranslate)).toBe('other');
  });
});
