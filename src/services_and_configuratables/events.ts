export type EventItem = {
  id: string
  title: string
  date: string
  location: string
  description: string
  details: string
  translations?: {
    mkd: Omit<EventItem, 'id' | 'date' | 'translations'>
  }
}

export const getLocalizedEvent = (event: EventItem, language: 'eng' | 'mkd'): EventItem =>
  language === 'mkd' && event.translations
    ? { ...event, ...event.translations.mkd }
    : event

export const events: EventItem[] = [
  {
    id: 'novosobir',
    title: 'New Years Eve Gathering',
    date: '2026-12-19T20:30:00',
    location: 'Skopje',
    description: 'New years eve gathering of Beetle Club Macedonia',
    details: 'Details will be added soon..',
    translations: {
      mkd: {
        title: 'Новогодишен Собир',
        location: 'Скопје',
        description: 'Новогодишен собир на Буба Клуб Македонија',
        details: 'Детали ќе бидат стаени наскоро...',
      },
    },
  },
 
]
