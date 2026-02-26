import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Spinner } from '@phosphor-icons/react'
import { useOnboardingStore } from '../../store/onboardingStore'
import client from '../../api/client'
import i18n from '../../i18n'

const EXAMPLES = [
  'Learn Spanish in 6 months',
  'Run a 5K race',
  'Launch my own business',
  'Read 24 books this year',
  'Get promoted at work',
  'Learn to play guitar',
]

export default function GoalPage() {
  const navigate = useNavigate()
  const { setGoalText, setParsedGoal } = useOnboardingStore()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await client.post<{ goal: any }>('/goals/voice-create', {
        text: text.trim(),
        language: i18n.language,
      })
      setGoalText(text)
      setParsedGoal(res.data)
      navigate('/onboarding/processing')
    } catch {
      setError('Failed to analyze your goal. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>What's your goal?</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Describe your dream in your own words — AI will create a personalized plan
          </p>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="I want to learn Spanish in 6 months to travel to Latin America..."
          rows={5}
          className="input resize-none mb-4 text-base"
          disabled={loading}
        />

        {/* Example chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => setText(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
              disabled={loading}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!text.trim() || loading}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors disabled:opacity-40"
        >
          {loading ? (
            <><Spinner size={20} className="animate-spin" /> Analyzing...</>
          ) : (
            <><ArrowRight size={20} weight="bold" /> Analyze with AI</>
          )}
        </button>

        <button
          onClick={() => navigate('/onboarding/showcase')}
          className="mt-4 text-sm text-center w-full transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          disabled={loading}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
