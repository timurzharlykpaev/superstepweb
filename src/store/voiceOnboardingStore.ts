import { create } from 'zustand'
import { voiceApi } from '../api/voice'
import api from '../api/client'
import type {
  VoiceCreateGoalResponse,
  VoiceCreateFinalResponse,
  VoiceCreateClarifyResponse,
  SubGoalDefinition,
  VoiceCreateFinalGoal,
  ClarifyQuestion,
  ClarifyAnswer,
  OnboardResult,
} from '../types/voice'

export type OnboardingStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'processing'
  | 'clarifying'
  | 'final'
  | 'creating'
  | 'completed'
  | 'error'

interface VoiceOnboardingState {
  status: OnboardingStatus
  error: string | null

  isRecording: boolean
  recordingDuration: number

  pendingAudio: { base64: string; language: string } | null

  transcribedText: string | null
  transcriptionProgress: number
  transcriptionElapsedMs: number

  processingElapsedMs: number

  sessionId: string | null
  clarifyQuestions: ClarifyQuestion[]
  clarifyAnswers: ClarifyAnswer[]
  currentRound: number
  maxRounds: number
  goalSummary: string | null

  finalGoal: VoiceCreateFinalGoal | null
  subGoals: SubGoalDefinition[]
  motivationalMessage: string | null

  createdGoalId: string | null
  onboardResult: OnboardResult | null

  startRecording: () => void
  stopRecording: (duration: number) => void
  setRecordingDuration: (duration: number) => void

  setPendingAudio: (base64: string, language: string) => void
  processAudio: () => Promise<void>

  setTextInput: (text: string) => void

  processGoal: (language: string) => Promise<void>

  answerQuestions: (answers: ClarifyAnswer[], language: string) => Promise<void>

  skipClarifying: (language: string) => Promise<void>

  confirmGoal: () => Promise<void>

  updateFinalGoal: (updates: Partial<VoiceCreateFinalGoal>) => void
  updateSubGoal: (index: number, updates: Partial<SubGoalDefinition>) => void
  removeSubGoal: (index: number) => void
  addSubGoal: (subGoal: SubGoalDefinition) => void

  cancelProcessing: () => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  status: 'idle' as OnboardingStatus,
  error: null,
  isRecording: false,
  recordingDuration: 0,
  pendingAudio: null,
  transcribedText: null,
  transcriptionProgress: 0,
  transcriptionElapsedMs: 0,
  processingElapsedMs: 0,
  sessionId: null,
  clarifyQuestions: [] as ClarifyQuestion[],
  clarifyAnswers: [] as ClarifyAnswer[],
  currentRound: 0,
  maxRounds: 2,
  goalSummary: null,
  finalGoal: null,
  subGoals: [] as SubGoalDefinition[],
  motivationalMessage: null,
  createdGoalId: null,
  onboardResult: null,
}

let activeAbortController: AbortController | null = null
let elapsedTimerInterval: ReturnType<typeof setInterval> | null = null
let elapsedTimerStartMs = 0

function startElapsedTimer(set: (state: Partial<VoiceOnboardingState>) => void) {
  stopElapsedTimer()
  elapsedTimerStartMs = Date.now()
  elapsedTimerInterval = setInterval(() => {
    set({ processingElapsedMs: Date.now() - elapsedTimerStartMs })
  }, 500)
}

function stopElapsedTimer() {
  if (elapsedTimerInterval) {
    clearInterval(elapsedTimerInterval)
    elapsedTimerInterval = null
  }
}

function handleVoiceCreateResponse(
  response: VoiceCreateGoalResponse,
  set: (state: Partial<VoiceOnboardingState>) => void
) {
  if (response.stage === 'clarifying') {
    const clarifyResponse = response as VoiceCreateClarifyResponse
    set({
      status: 'clarifying',
      sessionId: clarifyResponse.sessionId,
      clarifyQuestions: Array.isArray(clarifyResponse.questions) ? clarifyResponse.questions : [],
      currentRound: clarifyResponse.currentRound ?? 1,
      maxRounds: clarifyResponse.maxRounds ?? 2,
      goalSummary: clarifyResponse.summary || null,
    })
  } else {
    const finalResponse = response as VoiceCreateFinalResponse
    const goal = finalResponse.goal

    if (!goal || typeof goal.title !== 'string') {
      set({
        status: 'error',
        error: 'Invalid goal response from server',
      })
      return
    }

    const weight = typeof goal.weight === 'number' && goal.weight >= 1 && goal.weight <= 5
      ? goal.weight
      : 2

    set({
      status: 'final',
      sessionId: finalResponse.sessionId || null,
      finalGoal: { ...goal, weight: weight as 1 | 2 | 3 | 4 | 5 },
      subGoals: Array.isArray(finalResponse.subGoals) ? finalResponse.subGoals : [],
      motivationalMessage: finalResponse.motivationalMessage || '',
    })
  }
}

export const useVoiceOnboardingStore = create<VoiceOnboardingState>((set, get) => ({
  ...initialState,

  startRecording: () => {
    set({
      isRecording: true,
      recordingDuration: 0,
      error: null,
      status: 'recording',
    })
  },

  stopRecording: (duration: number) => {
    set({
      isRecording: false,
      recordingDuration: duration,
    })
  },

  setRecordingDuration: (duration: number) => {
    set({ recordingDuration: duration })
  },

  setPendingAudio: (base64: string, language: string) => {
    set({ pendingAudio: { base64, language }, status: 'transcribing' })
  },

  setTextInput: (text: string) => {
    set({ transcribedText: text, status: 'processing' })
  },

  processAudio: async () => {
    const { pendingAudio } = get()
    if (!pendingAudio) return

    activeAbortController?.abort()
    activeAbortController = new AbortController()
    const { signal } = activeAbortController

    set({ status: 'transcribing', error: null, transcriptionProgress: 0, transcriptionElapsedMs: 0, processingElapsedMs: 0 })
    startElapsedTimer(set)

    try {
      const { jobId } = await voiceApi.enqueueTranscription({
        audio: pendingAudio.base64,
        language: pendingAudio.language,
      })

      if (signal.aborted) return

      const result = await voiceApi.waitForTranscription(
        jobId,
        (progress) => set({ transcriptionProgress: progress }),
        (elapsedMs) => set({ transcriptionElapsedMs: elapsedMs }),
        signal,
      )

      if (signal.aborted) return

      if (result.status === 'failed') {
        if (result.error === 'CANCELLED') return
        const errorMsg = result.error === 'TRANSCRIPTION_TIMEOUT'
          ? 'Transcription took too long. Please try again.'
          : 'Transcription failed. Please try again.'
        throw new Error(errorMsg)
      }

      if (result.status === 'completed' && result.result) {
        set({
          transcribedText: result.result.text,
          status: 'processing',
        })

        await get().processGoal(pendingAudio.language)
      }
    } catch (error) {
      if (signal.aborted) return
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ status: 'error', error: message, pendingAudio: null })
    } finally {
      set({ pendingAudio: null })
      stopElapsedTimer()
      if (activeAbortController?.signal === signal) {
        activeAbortController = null
      }
    }
  },

  processGoal: async (language: string) => {
    const { transcribedText } = get()
    const trimmedText = transcribedText?.trim()

    if (!trimmedText || trimmedText.length < 3) {
      set({ error: 'Please provide a longer description', status: 'error' })
      return
    }

    if (!language) {
      set({ error: 'Language not detected', status: 'error' })
      return
    }

    const isStandalone = !activeAbortController
    if (isStandalone) {
      activeAbortController = new AbortController()
      startElapsedTimer(set)
    }
    const { signal } = activeAbortController!

    set({ status: 'processing', error: null })

    try {
      const response = await voiceApi.voiceCreate({
        transcript: trimmedText,
        language,
      }, signal)

      if (signal.aborted) return

      handleVoiceCreateResponse(response, set)
    } catch (error) {
      if (signal.aborted) return
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ status: 'error', error: message })
    } finally {
      if (isStandalone) {
        stopElapsedTimer()
        activeAbortController = null
      }
    }
  },

  answerQuestions: async (answers: ClarifyAnswer[], language: string) => {
    const { sessionId, clarifyAnswers, transcribedText } = get()

    if (!sessionId) {
      set({ error: 'Session expired. Please start over.', status: 'error' })
      return
    }

    set({
      status: 'processing',
      error: null,
      clarifyAnswers: [...clarifyAnswers, ...answers],
    })

    try {
      const response = await voiceApi.voiceCreate({
        transcript: transcribedText || '',
        language,
        sessionId,
        answers,
      })

      handleVoiceCreateResponse(response, set)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ status: 'error', error: message })
    }
  },

  skipClarifying: async (language: string) => {
    const { sessionId, clarifyAnswers, transcribedText } = get()

    set({ status: 'processing', error: null })

    try {
      const response = await voiceApi.voiceCreate({
        transcript: transcribedText || '',
        language,
        sessionId: sessionId || undefined,
        answers: clarifyAnswers.length > 0 ? clarifyAnswers : undefined,
      })

      if (response.stage === 'clarifying') {
        const clarifyResponse = response as VoiceCreateClarifyResponse
        const emptyAnswers = clarifyResponse.questions.map(q => ({
          questionId: q.id,
          answer: '',
        }))

        const finalResponse = await voiceApi.voiceCreate({
          transcript: transcribedText || '',
          language,
          sessionId: clarifyResponse.sessionId,
          answers: emptyAnswers,
        })

        handleVoiceCreateResponse(finalResponse, set)
      } else {
        handleVoiceCreateResponse(response, set)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ status: 'error', error: message })
    }
  },

  confirmGoal: async () => {
    const { finalGoal, subGoals } = get()
    if (!finalGoal) {
      set({ error: 'No goal to confirm', status: 'error' })
      return
    }

    set({ status: 'creating', error: null })

    try {
      const response = await voiceApi.voiceCreateConfirm({
        goal: finalGoal,
        subGoals,
      })

      // Mark onboarding complete on backend
      try {
        await api.post('/onboarding/complete', { language: 'en' })
      } catch {
        // non-fatal — proceed even if this fails
      }

      set({
        status: 'completed',
        createdGoalId: response.goalId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ status: 'error', error: message })
    }
  },

  updateFinalGoal: (updates: Partial<VoiceCreateFinalGoal>) => {
    const { finalGoal } = get()
    if (finalGoal) {
      set({ finalGoal: { ...finalGoal, ...updates } })
    }
  },

  updateSubGoal: (index: number, updates: Partial<SubGoalDefinition>) => {
    const { subGoals } = get()
    const newSubGoals = [...subGoals]
    newSubGoals[index] = { ...newSubGoals[index], ...updates }
    set({ subGoals: newSubGoals })
  },

  removeSubGoal: (index: number) => {
    const { subGoals } = get()
    set({ subGoals: subGoals.filter((_, i) => i !== index) })
  },

  addSubGoal: (subGoal: SubGoalDefinition) => {
    const { subGoals } = get()
    set({ subGoals: [...subGoals, subGoal] })
  },

  cancelProcessing: () => {
    activeAbortController?.abort()
    activeAbortController = null
    stopElapsedTimer()

    set({
      status: 'idle',
      error: null,
      pendingAudio: null,
      transcriptionProgress: 0,
      transcriptionElapsedMs: 0,
      processingElapsedMs: 0,
    })
  },

  setError: (error: string | null) => set({ error, status: error ? 'error' : get().status }),

  reset: () => {
    activeAbortController?.abort()
    activeAbortController = null
    stopElapsedTimer()
    set(initialState)
  },
}))
