import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoiceOnboardingStore } from '../../store/voiceOnboardingStore'

function normalizeQuestion(q: any, index: number) {
  if (!q) {
    return { id: `q-${index}`, question: '', type: 'text' }
  }
  if (typeof q === 'string') {
    return { id: `q-${index}`, question: q, type: 'text' }
  }
  const questionText =
    (typeof q.question === 'string' && q.question) ||
    (typeof q.text === 'string' && q.text) ||
    (typeof q.content === 'string' && q.content) ||
    ''
  return {
    id: q.id || `q-${index}`,
    question: questionText,
    type: q.type || 'text',
    choices: Array.isArray(q.choices) ? q.choices : undefined,
    placeholder: typeof q.placeholder === 'string' ? q.placeholder : undefined,
  }
}

export default function ClarifyPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const {
    status,
    clarifyQuestions: rawQuestions,
    currentRound,
    maxRounds,
    goalSummary,
    error,
    answerQuestions,
    skipClarifying,
    cancelProcessing,
  } = useVoiceOnboardingStore()

  const clarifyQuestions = rawQuestions.map(normalizeQuestion)
  const language = navigator.language?.split('-')[0] || 'en'

  useEffect(() => {
    if (status === 'idle') {
      navigate('/onboarding/goal')
    } else if (status === 'final') {
      navigate('/onboarding/result')
    }
  }, [status, navigate])

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }, [])

  const selectChoice = useCallback((questionId: string, choice: string) => {
    setAnswers(prev => {
      const current = prev[questionId]
      return { ...prev, [questionId]: current === choice ? '' : choice }
    })
  }, [])

  const hasAtLeastOneAnswer = Object.values(answers).some(a => a.trim().length > 0)

  const handleSubmit = useCallback(async () => {
    if (!hasAtLeastOneAnswer) return

    setIsSubmitting(true)
    try {
      const formattedAnswers = clarifyQuestions.map(q => ({
        questionId: q.id,
        answer: answers[q.id]?.trim() || '',
      }))

      await answerQuestions(formattedAnswers, language)

      const currentStatus = useVoiceOnboardingStore.getState().status
      if (currentStatus === 'final') {
        navigate('/onboarding/result')
      } else if (currentStatus === 'clarifying') {
        setIsSubmitting(false)
        setAnswers({})
      } else if (currentStatus === 'error') {
        setIsSubmitting(false)
      }
    } catch {
      setIsSubmitting(false)
    }
  }, [hasAtLeastOneAnswer, clarifyQuestions, answers, answerQuestions, language, navigate])

  const handleSkip = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await skipClarifying(language)

      const currentStatus = useVoiceOnboardingStore.getState().status
      if (currentStatus === 'final') {
        navigate('/onboarding/result')
      } else if (currentStatus === 'error') {
        setIsSubmitting(false)
      }
    } catch {
      setIsSubmitting(false)
    }
  }, [skipClarifying, language, navigate])

  const handleCancel = useCallback(() => {
    cancelProcessing()
    navigate('/onboarding/goal')
  }, [cancelProcessing, navigate])

  if (clarifyQuestions.length === 0 && !isSubmitting) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
          Help me understand better
        </h1>
        <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Round {currentRound} of {maxRounds}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        {goalSummary && (
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-surface)', borderLeft: '3px solid var(--color-primary, #8b5cf6)' }}>
            <p className="text-xs font-semibold mb-1 text-purple-600 uppercase tracking-wide">
              My Understanding
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {goalSummary}
            </p>
          </div>
        )}

        {clarifyQuestions.map((question, index) => (
          <div key={question.id} className="mb-6 rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex gap-3 mb-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 dark:bg-purple-900/30">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
              </div>
              <p className="font-semibold leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {question.question}
              </p>
            </div>

            {(question.type === 'text' || !question.type || question.type === 'number') && (
              <div className="flex gap-2">
                <input
                  type={question.type === 'number' ? 'number' : 'text'}
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder || 'Your answer...'}
                  className="flex-1 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>
            )}

            {question.type === 'choice' && question.choices && (
              <div className="space-y-2">
                {question.choices.map((choice: string) => {
                  const isSelected = answers[question.id] === choice
                  return (
                    <button
                      key={choice}
                      onClick={() => selectChoice(question.id, choice)}
                      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <span className={isSelected ? 'text-purple-600 dark:text-purple-400 font-medium' : ''} style={{ color: isSelected ? undefined : 'var(--color-text)' }}>
                        {choice}
                      </span>
                      {isSelected && <span className="text-purple-600 dark:text-purple-400 font-bold">✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t" style={{ borderColor: 'var(--color-surface)', backgroundColor: 'var(--color-background)' }}>
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`rounded-full ${i === 4 ? 'w-6 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-600'}`} />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!hasAtLeastOneAnswer || isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-4 rounded-xl mb-3 transition-colors"
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </button>

        <div className="flex justify-center gap-6">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
          >
            Skip questions
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-sm" style={{ color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
