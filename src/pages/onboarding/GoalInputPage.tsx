import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'

export default function GoalInputPage() {
  const navigate = useNavigate()
  const [goal, setGoal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return
    sessionStorage.setItem('onboarding-goal', goal)
    navigate('/onboarding/processing')
  }

  const examples = [
    'Learn Spanish fluently in 6 months',
    'Run my first marathon',
    'Build my own SaaS product',
  ]

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate('/app/today')}
          className="text-sm px-4 py-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              What's your main goal?
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Tell us what you want to achieve
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="I want to..."
              rows={5}
              className="input w-full resize-none"
              autoFocus
            />

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>EXAMPLES:</p>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGoal(ex)}
                  className="block w-full text-left text-sm p-3 mb-2 rounded-xl border border-black/5 dark:border-white/5 hover:border-purple-500/30 transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                >
                  <Sparkle size={14} weight="fill" className="inline mr-2 text-purple-400" />
                  {ex}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!goal.trim()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              Continue
              <ArrowRight size={20} weight="bold" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
