import { computed, reactive } from 'vue'
import translations from './translations.json'

export type LanguageCode = keyof typeof translations

const state = reactive({
  language: 'eng' as LanguageCode,
})

export const currentLanguageCode = computed({
  get: () => state.language,
  set: (value: LanguageCode) => {
    state.language = value
  },
})

export const currentTranslation = computed(() => translations[state.language])

export const languageOptions = computed(() =>
  Object.entries(translations).map(([code, content]) => ({
    code: code as LanguageCode,
    flag: content.meta.flag,
    label: content.meta.nativeName,
  })),
)

export const setLanguage = (code: LanguageCode) => {
  state.language = code
}
