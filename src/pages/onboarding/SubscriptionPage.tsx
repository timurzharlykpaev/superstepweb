import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Check, Sparkle, Lightning } from '@phosphor-icons/react'
import { useOnboardingStore } from '../../store/onboardingStore'
import api from '../../api/client'

const BENEFITS = [
  { icon: <Lightning size={18} weight="fill" />, text: 'Unlimited goals & sub-goals' },
  { icon: <Crown size={18} weight="fill" />, text: 'Unlimited AI coach messages' },
  { icon: <Sparkle size={18} weight="fill" />, text: 'AI image generation for wishes' },
  { icon: <Check size={18} weight="fill" />, text: 'Advanced analytics & insights' },
  { icon: <Check size={18} weight="fill" />, text: 'Voice input & transcription' },
  { icon: <Check size={18} weight="fill" />, text: 'Streak protection' },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const setCompleted = useOnboardingStore((s) => s.setCompleted)
  const [selected, setSelected] = useState<'yearly' | 'monthly'>('yearly')
  const [loading, setLoading] = useState(false)

  const completeOnboarding = async () => {
    setCompleted(true)
    // also mark on backend (best-effort)
    try { await api.post('/onboarding/complete', { language: 'en' }) } catch { /* ignore */ }
  }

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await api.post('/subscriptions/lemonsqueezy/checkout', {
        plan: selected,
        returnUrl: window.location.origin + '/app/today',
      })
      const url = res.data?.checkoutUrl || res.data?.url
      if (url) {
        await completeOnboarding()
        window.location.href = url
      } else {
        await completeOnboarding()
        navigate('/app/today')
      }
    } catch {
      // Checkout failed — still complete onboarding and go to app
      await completeOnboarding()
      navigate('/app/today')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
    navigate('/app/today')
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-background)', overflowY: 'auto' }}>
      <div className="flex justify-end px-4 pt-4 flex-shrink-0">
        <button onClick={handleSkip} className="text-sm px-4 py-2" style={{ color: 'var(--color-text-muted)' }}>
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 pb-8 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <Crown size={32} weight="fill" className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            Unlock Your Full Potential
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            7-day free trial, cancel anytime
          </p>
        </div>

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Yearly */}
          <button
            onClick={() => setSelected('yearly')}
            className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
              selected === 'yearly' ? 'border-purple-500 bg-purple-600/10' : 'border-transparent'
            }`}
            style={{ backgroundColor: selected === 'yearly' ? undefined : 'var(--color-surface)' }}
          >
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                SAVE 58%
              </span>
            </div>
            <div className="font-bold text-lg mt-1" style={{ color: 'var(--color-text)' }}>$29.99</div>
            <div className="text-xs font-medium text-purple-400">per year</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>$2.49/mo</div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => setSelected('monthly')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selected === 'monthly' ? 'border-purple-500 bg-purple-600/10' : 'border-transparent'
            }`}
            style={{ backgroundColor: selected === 'monthly' ? undefined : 'var(--color-surface)' }}
          >
            <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>$5.99</div>
            <div className="text-xs font-medium text-purple-400">per month</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>billed monthly</div>
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-purple-600/15 flex items-center justify-center text-purple-400 flex-shrink-0">
                {b.icon}
              </div>
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-4 rounded-xl mb-3 transition-colors"
        >
          {loading ? 'Loading...' : 'Start 7-Day Free Trial'}
        </button>

        <button onClick={handleSkip} className="w-full py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Maybe Later — Continue Free
        </button>

        <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Cancel anytime. No commitment.
        </p>
      </div>
    </div>
  )
}
