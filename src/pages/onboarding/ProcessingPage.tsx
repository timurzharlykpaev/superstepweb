import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  'Analyzing your goal...',
  'Creating your plan...',
  'Building milestones...',
  'Almost ready...',
]

export default function ProcessingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    const total = 2800
    const interval = 80
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const pct = Math.min(Math.round((elapsed / total) * 100), 99)
      setProgress(pct)
      setStepIdx(Math.min(Math.floor((pct / 100) * STEPS.length), STEPS.length - 1))

      if (elapsed >= total) {
        clearInterval(timer)
        setProgress(100)
        setTimeout(() => navigate('/onboarding/result'), 300)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #1a0a2e 50%, #0D0D0D 100%)' }}
    >
      {/* Pulsing ring */}
      <div className="relative mb-10">
        <div className="w-28 h-28 rounded-full bg-purple-600/20 animate-ping absolute inset-0" />
        <div className="w-28 h-28 rounded-full bg-purple-600/30 flex items-center justify-center relative">
          <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">{STEPS[stepIdx]}</h2>
      <p className="text-purple-300 mb-8">AI is working on your plan</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-purple-300">{progress}%</p>
      </div>
    </div>
  )
}
