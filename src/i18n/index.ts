import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './en.json'
import ru from './ru.json'
import es from './es.json'
import de from './de.json'
import fr from './fr.json'
import pt from './pt.json'
import zh from './zh.json'
import ja from './ja.json'
import ko from './ko.json'

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  pt: { translation: pt },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
}

export type LanguageCode = 'en' | 'ru' | 'es' | 'de' | 'fr' | 'pt' | 'zh' | 'ja' | 'ko'

const getDeviceLanguage = (): string => {
  const lang = navigator.language?.split('-')[0] || 'en'
  const supported = ['en', 'ru', 'es', 'de', 'fr', 'pt', 'zh', 'ja', 'ko']
  return supported.includes(lang) ? lang : 'en'
}

const storedLang = localStorage.getItem('language')
const initialLang = storedLang && storedLang !== 'system' ? storedLang : getDeviceLanguage()

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export const changeLanguage = (lang: LanguageCode | 'system') => {
  const resolved = lang === 'system' ? getDeviceLanguage() : lang
  localStorage.setItem('language', lang)
  i18n.changeLanguage(resolved)
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'ru' as const, name: 'Russian', nativeName: 'Русский' },
  { code: 'es' as const, name: 'Spanish', nativeName: 'Español' },
  { code: 'de' as const, name: 'German', nativeName: 'Deutsch' },
  { code: 'fr' as const, name: 'French', nativeName: 'Français' },
  { code: 'pt' as const, name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh' as const, name: 'Chinese', nativeName: '中文' },
  { code: 'ja' as const, name: 'Japanese', nativeName: '日本語' },
  { code: 'ko' as const, name: 'Korean', nativeName: '한국어' },
] as const

export default i18n
