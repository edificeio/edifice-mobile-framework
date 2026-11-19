import {
  canCreateTicket,
  canSendTicket,
  CREATE_TICKET_RIGHT,
  getCategoryLabel,
  getStructureChoices,
  getTicketCategories,
  SUBJECT_MAX_LENGTH,
} from './business';

const translations: Record<string, string> = {
  'support-createticket-category-blog': 'Blog (support)',
  'support-createticket-category-wiki': 'wiki (support)',
};
const translate = (key: string) => translations[key];
const serverLabels: Record<string, string> = { Admin: 'Administration', Blog: 'Blog (server)' };
const getServerLabel = (appName: string) => serverLabels[appName];

const app = (name: string, displayName: string, address = `/${displayName}`) => ({ address, displayName, name });

describe('canCreateTicket', () => {
  it('needs the workflow right', () => {
    expect(canCreateTicket([{ name: 'other|right' }, { name: CREATE_TICKET_RIGHT }])).toBe(true);
    expect(canCreateTicket([{ name: 'other|right' }])).toBe(false);
    expect(canCreateTicket([])).toBe(false);
  });
});

describe('canSendTicket', () => {
  it('needs a subject and a description', () => {
    expect(canSendTicket({ description: 'It fails', subject: 'Blog' })).toBe(true);
    expect(canSendTicket({ description: 'It fails', subject: '' })).toBe(false);
    expect(canSendTicket({ description: '', subject: 'Blog' })).toBe(false);
  });

  it('refuses a subject too long', () => {
    expect(canSendTicket({ description: 'It fails', subject: 'a'.repeat(SUBJECT_MAX_LENGTH) })).toBe(true);
    expect(canSendTicket({ description: 'It fails', subject: 'a'.repeat(SUBJECT_MAX_LENGTH + 1) })).toBe(false);
  });
});

describe('getCategoryLabel', () => {
  it('takes the label of support first', () => {
    expect(getCategoryLabel(app('Blog', 'Blog'), { getServerLabel, translate })).toBe('Blog (support)');
  });

  it('takes the label translated by the server when support has none', () => {
    expect(getCategoryLabel(app('Admin', 'admin.title'), { getServerLabel, translate })).toBe('Administration');
  });

  it('takes the displayName when there is no other', () => {
    expect(getCategoryLabel(app('Unknown', 'unknown.title'), { getServerLabel, translate })).toBe('unknown.title');
  });
});

describe('getTicketCategories', () => {
  it('lists the apps with an address and a name, and « other », sorted by label without case', () => {
    const categories = getTicketCategories(
      [app('Wiki', 'wiki'), app('Blog', 'blog'), app('Admin', 'admin.title'), app('', 'noname'), app('Link', 'link', '')],
      { getServerLabel, otherLabel: 'Other', translate },
    );
    expect(categories).toEqual([
      { label: 'Administration', value: '/admin.title' },
      { label: 'Blog (support)', value: '/blog' },
      { label: 'Other', value: 'other' },
      { label: 'wiki (support)', value: '/wiki' },
    ]);
  });

  it('has « other » without apps', () => {
    expect(getTicketCategories([], { getServerLabel, otherLabel: 'Other', translate })).toEqual([
      { label: 'Other', value: 'other' },
    ]);
  });
});

describe('getStructureChoices', () => {
  it('lists the structures of the user', () => {
    expect(getStructureChoices([{ id: 's1', name: 'School 1' }])).toEqual([{ label: 'School 1', value: 's1' }]);
    expect(getStructureChoices(undefined)).toEqual([]);
  });
});
