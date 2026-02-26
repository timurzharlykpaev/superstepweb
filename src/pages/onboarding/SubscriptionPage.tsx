import { useNavigate } from 'react-router-dom'
import { Crown, Check, Sparkle } from '@phosphor-icons/react'

const BENEFITS = [
  { icon: <Sparkle size={20} weight="fill" />, text: 'Unlimited goals & tasks' },
  { icon: <Crown size={20} weight="fill" />, text: 'AI coach & personalized insights' },
  { icon: <Check size={20} weight="fill" />, text: 'Advanced analytics & progress tracking' },
  { icon: <Sparkle size={20} weight="fill" />, text: 'Priority support' },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()

  const handleStartTrial = () => {
    navigate('/app/today')
  }

  const handleSkip = () => {
    navigate('/app/today')
  }

  return (
    <div className="min-h-screen flex flex-col p-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
              <Crown size={40} weight="fill" className="text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Unlock Your Full Potential
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Start your 7-day free trial
            </p>
          </div>

          {/* Trial offer card */}
          <div className="rounded-xl p-6 mb-6 border-2 border-purple-500/30 bg-purple-600/5">
            <div className="text-center mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-600 text-white text-sm font-semibold mb-3">
                7 DAYS FREE
              </div>
              <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                Try Pro for Free
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Then $9.99/month
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            <p className="text-xs font-semibold px-1" style={{ color: 'var(--color-text-muted)' }}>
              WHAT YOU GET
            </p>
            {BENEFITS.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl border border-black/5 dark:border-white/5"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="w-10 h-10 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400">
                  {benefit.icon}
                </div>
                <span style={{ color: 'var(--color-text)' }}>{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleStartTrial}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl mb-3 transition-colors"
          >
            Start Free Trial
          </button>

          <button
            onClick={handleSkip}
            className="w-full py-3 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Maybe Later
          </button>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Cancel anytime. No commitment.
          </p>
        </div>
      </div>
    </div>
  )
}
