import { useState } from 'react'
import { Globe, Check } from '@phosphor-icons/react'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n'
import { useTranslation } from 'react-i18next'

export default function LangPickerInline() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Globe size={15} />
        <span>{current.flag}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-black/5 dark:border-white/10 shadow-xl z-50 py-1 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)' }}>
            {SUPPORTED_LANGUAGES.map(lang => (
              <button key={lang.code}
                onClick={() => { changeLanguage(lang.code as any); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-purple-500/10 ${i18n.language === lang.code ? 'text-purple-400' : ''}`}
                style={i18n.language !== lang.code ? { color: 'var(--color-text)' } : {}}>
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.nativeName}</span>
                {i18n.language === lang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
