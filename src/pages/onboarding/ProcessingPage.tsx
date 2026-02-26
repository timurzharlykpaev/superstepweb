import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoiceOnboardingStore } from '../../store/voiceOnboardingStore'

export default function ProcessingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Analyzing your goal...')
  const processingStarted = useRef(false)

  const {
    status,
    finalGoal,
    error,
    pendingAudio,
    transcribedText,
    transcriptionProgress,
    processingElapsedMs,
    processAudio,
    processGoal,
    cancelProcessing,
  } = useVoiceOnboardingStore()

  const language = navigator.language?.split('-')[0] || 'en'

  // Start processing when data is available
  useEffect(() => {
    if (processingStarted.current) return

    if (pendingAudio) {
      processingStarted.current = true
      processAudio().catch(() => {
        // Error state is already set in the store
      })
    } else if (transcribedText && status === 'processing') {
      processingStarted.current = true
      processGoal(language).catch(() => {
        // Error state is already set in the store
      })
    }
  }, [pendingAudio, transcribedText, status, processAudio, processGoal, language])

  // Redirect back if no data after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!processingStarted.current && !pendingAudio && !transcribedText) {
        navigate('/onboarding/goal')
      }
    }, 2000)

    return () => clearTimeout(timeout)
  }, [pendingAudio, transcribedText, navigate])

  // Progress tracking: real backend progress for transcribing, simulated for processing
  useEffect(() => {
    if (status === 'transcribing') {
      const mappedProgress = Math.round((transcriptionProgress / 100) * 40)
      setProgress(mappedProgress)
      return
    }

    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev < 40 ? 40 : prev + 2
        })
      }, 300)
      return () => clearInterval(interval)
    }

    if (status === 'final' || status === 'clarifying') {
      setProgress(100)
    }
  }, [status, transcriptionProgress])

  // Update status text based on status and progress
  useEffect(() => {
    if (status === 'transcribing') {
      if (processingElapsedMs > 60_000) {
        setStatusText('This is taking longer than usual...')
      } else {
        setStatusText('Transcribing your voice...')
      }
    } else if (status === 'processing' && processingElapsedMs > 45_000) {
      setStatusText('This is taking longer than usual...')
    } else if (progress < 60) {
      setStatusText('Creating your plan...')
    } else if (progress < 85) {
      setStatusText('Setting up habits...')
    } else if (progress < 100) {
      setStatusText('Almost done...')
    }
  }, [progress, status, processingElapsedMs])

  // Navigate to clarify screen when AI asks questions
  useEffect(() => {
    if (status === 'clarifying') {
      setProgress(100)
      setStatusText('Done!')

      const timer = setTimeout(() => {
        navigate('/onboarding/clarify')
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  // Navigate to result when done
  useEffect(() => {
    if (status === 'final' && finalGoal) {
      setProgress(100)
      setStatusText('Done!')

      const delay = processingStarted.current ? 600 : 50
      const timer = setTimeout(() => {
        navigate('/onboarding/result')
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [status, finalGoal, navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-6 text-center" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Something went wrong</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
        <button
          onClick={() => {
            cancelProcessing()
            navigate('/onboarding/goal')
          }}
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
          {statusText}
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

        {/* Goal preview when available */}
        {finalGoal && (
          <div className="mt-8 rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <span className="text-green-500 text-xl">✓</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">{finalGoal.emoji || '🎯'}</span>
              <span className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {finalGoal.title}
              </span>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {(status === 'transcribing' || status === 'processing') && processingElapsedMs > 3_000 && (
          <button
            onClick={() => {
              cancelProcessing()
              navigate('/onboarding/goal')
            }}
            className="mt-6 text-sm" style={{ color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
        )}

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
