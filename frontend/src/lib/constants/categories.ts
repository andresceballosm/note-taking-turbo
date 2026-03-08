export const CATEGORIES = {
  'Random Thoughts': {
    color: '#EF9C66',
    background: 'rgba(239, 156, 102, 0.5)',
    border: '#EF9C66',
    dot: '#EF9C66',
  },
  School: {
    color: '#FCDC94',
    background: 'rgba(252, 220, 148, 0.5)',
    border: '#FCDC94',
    dot: '#FCDC94',
  },
  Personal: {
    color: '#78ABA8',
    background: 'rgba(120, 171, 168, 0.5)',
    border: '#78ABA8',
    dot: '#78ABA8',
  },
} as const;

export type NoteCategory = keyof typeof CATEGORIES;

export const CATEGORY_OPTIONS = [
  { value: 'Personal' as const, label: 'Personal', color: CATEGORIES.Personal.color },
  { value: 'School' as const, label: 'School', color: CATEGORIES.School.color },
  { value: 'Random Thoughts' as const, label: 'Random Thoughts', color: CATEGORIES['Random Thoughts'].color },
];

// Named constants for timing and configuration
export const AUTOSAVE_DEBOUNCE_MS = 700;
export const NOTES_STALE_TIME_MS = 60_000; // 1 minute
export const NOTES_GC_TIME_MS = 1_800_000; // 30 minutes
