import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProcessingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Analyzing your goal...')

  useEffect(() => {
    const goal = sessionStorage.getItem('onboarding-goal')
    if (!goal) {
      navigate('/onboarding/goal')
      return
    }

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 95))
    }, 100)

    const statuses = [
      { at: 0, text: 'Analyzing your goal...' },
      { at: 2000, text: 'Creating your personalized plan...' },
      { at: 4000, text: 'Setting up weekly milestones...' },
      { at: 6000, text: 'Almost done...' },
    ]

    const timeouts = statuses.map(({ at, text }) =>
      setTimeout(() => setStatus(text), at)
    )

    const finalTimeout = setTimeout(() => {
      setProgress(100)
      setStatus('Done!')
      setTimeout(() => navigate('/onboarding/result'), 600)
    }, 7000)

    return () => {
      clearInterval(progressInterval)
      timeouts.forEach(clearTimeout)
      clearTimeout(finalTimeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md text-center">
        <div className="text-8xl mb-8 animate-bounce">🤖</div>

        <h2 className="text-2xl font-semibold mb-8" style={{ color: 'var(--color-text)' }}>
          {status}
        </h2>

        <div className="mb-4">
          <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {progress}%
          </p>
        </div>

        {progress < 100 && (
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  )
}
