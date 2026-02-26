import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Spinner } from '@phosphor-icons/react'
import { useOnboardingStore } from '../../store/onboardingStore'
import client from '../../api/client'
import i18n from '../../i18n'

export default function ResultPage() {
  const navigate = useNavigate()
  const { parsedGoal, setCompleted } = useOnboardingStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const goal = parsedGoal?.goal
  const subGoals = parsedGoal?.subGoals || goal?.subGoals || []

  if (!goal) {
    navigate('/onboarding/goal')
    return null
  }

  const handleStart = async () => {
    setSaving(true)
    setError('')
    try {
      // Save the goal
      await client.post('/goals/voice-create/confirm', {
        goal: {
          title: goal.title,
          description: goal.description,
          category: goal.category,
          level: goal.level || 'global',
          color: goal.color || '#8B5CF6',
        },
        subGoals: subGoals.map((sg: any) => ({
          title: sg.title,
          description: sg.description,
        })),
      })
      // Mark onboarding complete
      await client.post('/onboarding/complete', { language: i18n.language }).catch(() => {})
      setCompleted(true)
      navigate('/app/today')
    } catch {
      setError('Failed to save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Your Goal is Ready!</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>AI has created your personalized plan</p>
        </div>

        {/* Goal card */}
        <div className="rounded-2xl p-5 mb-4 border border-purple-500/20" style={{ backgroundColor: 'var(--color-surface)', borderLeft: '4px solid #8B5CF6' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{goal.title}</h2>
          {goal.description && (
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>{goal.description}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {goal.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">{goal.category}</span>
            )}
            {goal.level && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">{goal.level}</span>
            )}
          </div>
        </div>

        {/* Sub-goals */}
        {subGoals.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
              MILESTONES ({subGoals.length})
            </p>
            <div className="space-y-2">
              {subGoals.map((sg: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <CheckCircle size={18} weight="fill" className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{sg.title}</p>
                    {sg.description && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sg.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">{error}</div>
        )}

        <button
          onClick={handleStart}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors disabled:opacity-40"
        >
          {saving ? (
            <><Spinner size={20} className="animate-spin" /> Saving...</>
          ) : (
            <><ArrowRight size={20} weight="bold" /> Start My Journey</>
          )}
        </button>

        <button
          onClick={() => navigate('/onboarding/goal')}
          className="mt-4 text-sm text-center w-full"
          style={{ color: 'var(--color-text-muted)' }}
          disabled={saving}
        >
          ← Edit goal
        </button>
      </div>
    </div>
  )
}
