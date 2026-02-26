import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'

export default function ResultPage() {
  const navigate = useNavigate()
  const goal = sessionStorage.getItem('onboarding-goal') || 'Your goal'
  const [milestones] = useState([
    { title: 'Week 1-2: Foundation', desc: 'Build the basics and establish your routine' },
    { title: 'Week 3-4: Practice', desc: 'Daily practice to build momentum' },
    { title: 'Week 5-8: Advanced', desc: 'Level up and tackle challenges' },
  ])

  const handleContinue = () => {
    navigate('/onboarding/subscription')
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Your Plan is Ready!
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Here's your personalized roadmap to success
          </p>
        </div>

        {/* Main goal */}
        <div className="rounded-xl p-6 mb-6 border border-purple-500/20" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-start gap-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {goal}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                AI-powered plan tailored to you
              </p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold px-1" style={{ color: 'var(--color-text-muted)' }}>
            YOUR MILESTONES
          </h3>
          {milestones.map((m, i) => (
            <div
              key={i}
              className="rounded-xl p-4 border border-black/5 dark:border-white/5"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-start gap-3">
                <CheckCircle size={20} weight="fill" className="text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    {m.title}
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-8 bg-purple-600/10 border border-purple-500/20">
          <p className="text-sm text-center italic" style={{ color: 'var(--color-text-muted)' }}>
            "Every expert was once a beginner. Start today!"
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition-colors"
        >
          Continue
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
