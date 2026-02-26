import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n'

export default function LanguagePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('en')

  const handleContinue = async () => {
    await changeLanguage(selected as any)
    navigate('/onboarding/showcase')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Choose your language</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>You can change this later in settings</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                selected === lang.code
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'hover:bg-purple-500/10'
              }`}
              style={selected !== lang.code ? {
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              } : {}}
            >
              <div className="text-lg mb-0.5">{lang.flag || '🌐'}</div>
              <div className="text-xs">{lang.nativeName}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          Continue
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
