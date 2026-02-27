import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Microphone, Stop, TextT, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { useVoiceOnboardingStore } from '../../store/voiceOnboardingStore'

type Mode = 'voice' | 'text'
type RecordState = 'idle' | 'recording' | 'processing'

const EXAMPLES = [
  'I want to lose 10 kg in 3 months',
  'Learn English to B2 level',
  'Save $5000 for a trip',
]

export default function GoalInputPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('voice')
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStartTime = useRef<number>(0)

  const { setPendingAudio, setTextInput: storeSetTextInput } = useVoiceOnboardingStore()

  const language = navigator.language?.split('-')[0] || 'en'

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      recordingStartTime.current = Date.now()

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setRecordState('processing')
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]
            setPendingAudio(base64, language)
            navigate('/onboarding/processing')
          }
          reader.readAsDataURL(blob)
        } catch {
          setError('Failed to process audio. Please try text input.')
          setRecordState('idle')
        }
      }

      mr.start()
      mediaRef.current = mr
      setRecordState('recording')
    } catch {
      setError('Microphone access denied. Please use text input.')
    }
  }, [language, navigate, setPendingAudio])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    mediaRef.current = null
  }, [])

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim()) return
    storeSetTextInput(textInput.trim())
    navigate('/onboarding/processing')
  }, [textInput, storeSetTextInput, navigate])

  // ── Text mode ──────────────────────────────────────────────────────────────
  if (mode === 'text') {
    return (
      <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
        <div className="flex-shrink-0 flex items-center px-4 pt-4 pb-2">
          <button
            onClick={() => setMode('voice')}
            className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 pt-2 min-h-0">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📝</div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Write your goals</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Describe your goals and dreams in your own words</p>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="I want to lose 10 kg, learn English to B2 level, save money for a car..."
            className="flex-1 resize-none rounded-2xl p-4 text-base outline-none border border-transparent focus:border-purple-500/40 transition-colors"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', minHeight: 0 }}
            autoFocus
          />
        </div>

        <div className="flex-shrink-0 px-6 pb-8 pt-4">
          {/* Dots */}
          <div className="flex justify-center gap-2 mb-4">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className={`rounded-full ${i === 2 ? 'w-6 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-600'}`} />
            ))}
          </div>

          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
          >
            Continue <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </div>
    )
  }

  // ── Voice mode ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
      {/* Skip */}
      <div className="flex-shrink-0 flex justify-end px-4 pt-4">
        <button
          onClick={() => navigate('/app/today')}
          className="text-sm px-4 py-2 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        {recordState === 'idle' && (
          <div className="text-center mb-6 w-full max-w-sm">
            <img
              src="/onboarding-voice.png"
              alt="Voice input"
              className="w-44 h-32 object-contain mx-auto mb-4 drop-shadow-xl"
            />
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Tell me about your goals
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Speak freely about your dreams and goals. I'll help you structure them.
            </p>
          </div>
        )}

        {recordState === 'recording' && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              Recording...
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Tap the button to stop</p>
          </div>
        )}

        {recordState === 'processing' && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Processing...</h1>
          </div>
        )}

        {/* Mic button */}
        {recordState !== 'processing' && (
          <button
            onClick={recordState === 'idle' ? startRecording : stopRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
              recordState === 'recording'
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {recordState === 'recording'
              ? <Stop size={36} weight="fill" className="text-white" />
              : <Microphone size={36} weight="fill" className="text-white" />
            }
          </button>
        )}

        {recordState === 'idle' && (
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Tap to start recording
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center px-4">{error}</p>
        )}
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 px-6 pb-8 pt-2 max-w-md mx-auto w-full">
        {recordState === 'idle' && (
          <>
            {/* Examples */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>EXAMPLES:</p>
              {EXAMPLES.map((ex, i) => (
                <p key={i} className="text-sm italic mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  "{ex}"
                </p>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-4">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className={`rounded-full ${i === 2 ? 'w-6 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-600'}`} />
              ))}
            </div>

            {/* Type instead */}
            <button
              onClick={() => setMode('text')}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl mb-3 font-semibold text-sm transition-colors"
              style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
            >
              <TextT size={18} /> I prefer to type instead
            </button>

            {/* Skip */}
            <button
              onClick={() => navigate('/app/today')}
              className="w-full text-center text-sm py-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Skip for now →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
