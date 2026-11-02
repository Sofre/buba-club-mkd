export type EventItem = {
  id: string
  title: string
  date: string
  location: string
  description: string
  details: string
}

export const events: EventItem[] = [
  {
    id: 'sunset-cruise',
    title: '12 year anniversary',
    date: '2026-08-02T20:30:00',
    location: 'Skopje',
    description: 'A relaxed evening cruise through the city skyline with a dinner stop at the end.',
    details: 'Meet at the old town square before sunset, bring your favourite classic VW and join the group for photos and a short route through the city.',
  },
  {
    id: 'open-garage-day',
    title: 'Open Garage Day',
    date: '2026-12-09T11:00:00',
    location: 'Club workshop',
    description: 'Bring your project, swap parts and enjoy coffee with fellow builders.',
    details: 'The workshop will be open for restoration chats, tool sharing and a relaxed social meetup for members and guests.',
  },
  {
    id: 'weekend-showdown',
    title: 'Weekend Showdown',
    date: '2026-12-16T17:00:00',
    location: 'Main square',
    description: 'A judged meetup with music, trophies and a community raffle.',
    details: 'Expect a lively afternoon with club cars on display, family-friendly activities and a prize draw for supporters.',
  },
  {
    id: 'beetle-breakfast',
    title: 'Beetle Breakfast',
    date: '2026-11-23T09:00:00',
    location: 'Riverfront cafe',
    description: 'Start the weekend with coffee, stories and a slow drive through the countryside.',
    details: 'A casual morning meetup for members who want a relaxed start to the day and a short scenic route afterward.',
  },
]
