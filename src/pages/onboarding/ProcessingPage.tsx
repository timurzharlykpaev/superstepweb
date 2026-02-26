import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

const STATUSES = [
  { at: 0,    text: 'Analyzing your goal...' },
  { at: 2000, text: 'Creating your personalized plan...' },
  { at: 4000, text: 'Setting up weekly milestones...' },
  { at: 6000, text: 'Almost done...' },
]

export default function ProcessingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Analyzing your goal...')
  const [error, setError] = useState('')

  useEffect(() => {
    const text = sessionStorage.getItem('onboarding-goal')
    const audioBase64 = sessionStorage.getItem('onboarding-audio')
    const lang = sessionStorage.getItem('onboarding-audio-lang') || navigator.language?.split('-')[0] || 'en'

    if (!text && !audioBase64) {
      navigate('/onboarding/goal')
      return
    }

    // Fake progress animation
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 1.5, 90))
    }, 120)

    const statusTimeouts = STATUSES.map(({ at, text: t }) =>
      setTimeout(() => setStatus(t), at)
    )

    // API call
    const run = async () => {
      try {
        let payload: { text: string; language: string }

        if (audioBase64) {
          // Step 1: transcribe audio via backend
          const transcribeRes = await api.post('/goals/voice-transcribe', {
            audio: audioBase64,
            language: lang,
          })
          const transcribed = transcribeRes.data?.text || transcribeRes.data
          if (!transcribed) throw new Error('Transcription failed')
          payload = { text: transcribed, language: lang }
        } else {
          payload = { text: text!, language: lang }
        }

        // Step 2: generate goal plan
        const res = await api.post('/goals/voice-create', payload)
        const data = res.data

        setProgress(100)
        setStatus('Done!')

        // Store result for result page
        sessionStorage.setItem('onboarding-result', JSON.stringify(data))
        sessionStorage.removeItem('onboarding-audio')

        setTimeout(() => navigate('/onboarding/result'), 600)
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || 'Something went wrong'
        setError(msg)
        clearInterval(progressInterval)
      }
    }

    run()

    return () => {
      clearInterval(progressInterval)
      statusTimeouts.forEach(clearTimeout)
    }
  }, [navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 text-center" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Something went wrong</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        <button
          onClick={() => navigate('/onboarding/goal')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-6" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-8 animate-bounce">🤖</div>

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
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{Math.round(progress)}%</p>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {[0, 150, 300].map(delay => (
            <div
              key={delay}
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
