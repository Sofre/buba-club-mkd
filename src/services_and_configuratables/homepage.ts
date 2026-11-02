import translations from './translations.json'
import { currentLanguageCode, type LanguageCode } from './translations_state_change'

export type HomepageSection = (typeof translations.eng)['home']

export const getHomepageTranslations = (languageCode?: LanguageCode) => {
  const code = languageCode ?? currentLanguageCode.value
  return translations[code]?.home ?? translations.eng.home
}

export default getHomepageTranslations
