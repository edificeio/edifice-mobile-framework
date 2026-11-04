import { getAppColor, getAppIcon, getHelpUrl, normalizeIconName } from './display';

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

  it('keeps a path or a URL as it is', () => {
    expect(getAppIcon({ icon: '/workspace/document/AbC-large?thumbnail=100x100', name: 'X' })).toBe(
      '/workspace/document/AbC-large?thumbnail=100x100',
    );
    expect(getAppIcon({ icon: 'https://Example.com/Icon.PNG', name: 'X' })).toBe('https://Example.com/Icon.PNG');
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

  it('has no link if none is set', () => {
    expect(getHelpUrl({}, 'fr')).toBeUndefined();
    expect(getHelpUrl({ fr: '' }, 'fr')).toBeUndefined();
  });

  it('takes the language, then the base language, then French', () => {
    expect(getHelpUrl(helpUrls, 'pt-BR')).toBe('https://pt-br');
    expect(getHelpUrl(helpUrls, 'en-GB')).toBe('https://en');
    expect(getHelpUrl(helpUrls, 'es')).toBe('https://fr');
    expect(getHelpUrl({ es: 'https://es' }, 'de')).toBeUndefined();
    expect(getHelpUrl({}, 'fr')).toBeUndefined();
  });
});
