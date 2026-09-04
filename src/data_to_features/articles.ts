import type { LanguageCode } from './translations_state_change'

export type ArticleKind = 'text' | 'photo' | 'video' | 'social'
export type ArticleSocialPlatform = 'instagram' | 'facebook'

export type ArticleEntry = {
  id: string
  postedAt: string
  kind: ArticleKind
  tag: string
  title: string
  body: string
  imageUrl?: string
  videoUrl?: string
  socialUrl?: string
  socialPlatform?: ArticleSocialPlatform
}

export type ArticlesPageCopy = {
  eyebrow: string
  title: string
  ticker: string[]
}

const pageCopy: Record<LanguageCode, ArticlesPageCopy> = {
  eng: {
    eyebrow: 'Club Articles',
    title: 'Driven by Passion: Our Stories',
    ticker: ['photos', 'videos', 'social posts', 'stories', 'garage notes'],
  },
  mkd: {
    eyebrow: 'Клубски артикли',
    title: 'Водени од страста: Нашите приказни',
    ticker: ['фотографии', 'видеа', 'објави од социјални мрежи', 'приказни', 'белешки од гаража'],
  },
}

const articlesByLanguage: Record<LanguageCode, ArticleEntry[]> = {
  eng: [
    {
      id: 'night-drive-recap',
      postedAt: '2026-08-25T20:30:00Z',
      kind: 'photo',
      tag: 'Drive Log',
      title: 'Christmas Meet Up - Vlae 2021',
      body: '',
      imageUrl: 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365492/DSC06202_wzkuj8.jpg',
    },
    {
      id: 'video-tune-checkinfoyt',
      postedAt: '2026-08-19T18:10:00Z',
      kind: 'video',
      tag: 'Drive Log',
      title: 'Youtube Video Title: Buba Club Macedonia Cruising the town',
      body: '',
      videoUrl: 'https://www.youtube.com/watch?v=3tVUOqSMKV8&t=26s',
    },
    {
      id: 'club-on-instagram',
      postedAt: '2026-08-18T16:00:00Z',
      kind: 'social',
      tag: 'Social',
      title: 'Fresh post from our Instagram',
      body: 'Event highlights and behind-the-scenes moments are now on our Instagram feed.',
      socialPlatform: 'instagram',
      socialUrl: 'https://www.instagram.com/bubaklubmakedonija/',
    },
    {
      id: 'old-sticker-story',
      postedAt: '2026-08-16T10:45:00Z',
      kind: 'text',
      tag: 'Story',
      title: 'The sticker that stayed on for 20 years',
      body: 'One member found an original trip sticker from 2006 under a rear window seal. Small detail, big memory. We kept it exactly where it was.',
    },
    {
      id: 'restoration-project-spotlight',
      postedAt: '2026-08-09T13:00:00Z',
      kind: 'photo',
      tag: 'Restoration',
      title: 'Project spotlight: engine bay progress',
      body: 'A clean-up, repaint, and careful wiring pass transformed the bay. This one started from one of our old news updates and now has fresh photos.',
      imageUrl: 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365406/DSC06184_uwa9fq.jpg',
    },
    {
      id: 'weekend-meet-announcement',
      postedAt: '2026-08-01T08:30:00Z',
      kind: 'text',
      tag: 'Club Wire',
      title: 'Weekend meet announced',
      body: 'Coffee, stories, and classic Beetles this Sunday morning. Same lot, same vibe, more cars. Bring a friend who loves classics.',
    },
  ],
  mkd: [
    {
      id: 'night-drive-recap',
      postedAt: '2026-08-25T20:30:00Z',
      kind: 'photo',
      tag: 'Патување',
      title: 'Ноќно возење по собирот',
      body: 'Кратка градска рута, отворени прозорци и препознатливиот звук на air-cooled моторите. Најубаво беше што возеа заедно и стари и нови членови.',
      imageUrl: 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365492/DSC06202_wzkuj8.jpg',
    },
    {
      id: 'garage-cam-idle-tune',
      postedAt: '2026-08-19T18:10:00Z',
      kind: 'video',
      tag: 'Гаража',
      title: 'Краток тест на лер во работилница',
      body: 'Брз видео-клип од штелување карбуратор пред викенд рутата. Уште не е совршено, но ритамот си доаѓа.',
      videoUrl: 'https://www.youtube.com/embed/LX4fQx9H5fM',
    },
    {
      id: 'club-on-facebook',
      postedAt: '2026-08-18T16:00:00Z',
      kind: 'social',
      tag: 'Социјални мрежи',
      title: 'Нова објава на Facebook',
      body: 'Погледнете ги најновите клубски вести и фотографии објавени на нашата Facebook страна.',
      socialPlatform: 'facebook',
      socialUrl: 'https://www.facebook.com/',
    },
    {
      id: 'old-sticker-story',
      postedAt: '2026-08-16T10:45:00Z',
      kind: 'text',
      tag: 'Приказна',
      title: 'Налепница што останала 20 години',
      body: 'Еден член пронајде оригинална налепница од патување во 2006, скриена под гума на задно стакло. Мал детаљ, голем спомен.',
    },
    {
      id: 'restoration-project-spotlight',
      postedAt: '2026-08-09T13:00:00Z',
      kind: 'photo',
      tag: 'Реставрација',
      title: 'Фокус проект: напредок во моторниот простор',
      body: 'Чистење, нова боја и внимателно средување на инсталацијата. Ова почна како старо клупско известување, а сега доби нови фотографии.',
      imageUrl: 'https://res.cloudinary.com/rjugb9ky/image/upload/v1785365406/DSC06184_uwa9fq.jpg',
    },
    {
      id: 'weekend-meet-announcement',
      postedAt: '2026-08-01T08:30:00Z',
      kind: 'text',
      tag: 'Клубска жица',
      title: 'Објавен е викенд собир',
      body: 'Кафе, приказни и класични Буби оваа недела наутро. Иста локација, иста атмосфера, повеќе автомобили.',
    },
  ],
}

export const getArticlesPageCopy = (language: LanguageCode): ArticlesPageCopy => pageCopy[language]

export const getArticlesForLanguage = (language: LanguageCode): ArticleEntry[] => articlesByLanguage[language]
