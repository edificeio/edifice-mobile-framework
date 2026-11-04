import { withFavorites, withFavoriteToggled } from './favorites';

describe('withFavoriteToggled', () => {
  it('adds an app that is not a favorite, at the end', () => {
    expect(withFavoriteToggled({ applications: [], favorites: ['A'] }, 'B')).toEqual({ applications: [], favorites: ['A', 'B'] });
  });

  it('removes a favorite', () => {
    expect(withFavoriteToggled({ applications: [], favorites: ['A', 'B'] }, 'A')).toEqual({ applications: [], favorites: ['B'] });
  });

  it('gives `applications` back as it is, without any check', () => {
    expect(withFavoriteToggled({ applications: ['A', 'B'], favorites: ['A', 'Z'] }, 'C')).toEqual({
      applications: ['A', 'B'],
      favorites: ['A', 'Z', 'C'],
    });
  });

  it('does not change the preferences given', () => {
    const preferences = { applications: [], favorites: ['A'] };
    withFavoriteToggled(preferences, 'B');
    expect(preferences).toEqual({ applications: [], favorites: ['A'] });
  });
});

describe('withFavorites', () => {
  it('replaces the favorites and keeps `applications`', () => {
    expect(withFavorites({ applications: ['A'], favorites: ['A'] }, ['B', 'Z'])).toEqual({
      applications: ['A'],
      favorites: ['B', 'Z'],
    });
  });
});
