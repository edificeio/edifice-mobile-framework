import { getAppTestID, normalizeString, toKebabCase } from './util';

describe('normalizeString', () => {
  it('is in lower case, without accents', () => {
    expect(normalizeString('Écoles Él')).toBe('ecoles el');
  });
});

describe('toKebabCase', () => {
  it('splits camelCase and spaces, and drops the other characters', () => {
    expect(toKebabCase('CahierTextes de (1)')).toBe('cahier-textes-de-1');
  });
});

describe('getAppTestID', () => {
  it('is the name in kebab case, without accents', () => {
    expect(getAppTestID({ name: 'Espace documentaire' })).toBe('myapps-espace-documentaire');
    expect(getAppTestID({ name: 'CahierTextes' })).toBe('myapps-cahier-textes');
    expect(getAppTestID({ name: 'Actualités (1)' })).toBe('myapps-actualites-1');
  });
});
