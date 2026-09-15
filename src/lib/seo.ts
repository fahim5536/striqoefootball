import slugify from 'slugify';

export const createSlug = (text: string) => {
  if (!text) return '';
  return slugify(text, { lower: true, strict: true });
};

export const getTournamentUrl = (id: string, name?: string) => {
  if (!name) return `/tournaments/${id}`;
  return `/tournaments/${id}/${createSlug(name)}`;
};

export const getProfileUrl = (id: string, name?: string) => {
  // Currently profile uses ?uid=
  // but if we want we can just return the uid version
  return `/profile?uid=${id}`;
};
