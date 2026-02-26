import client from './client'
import type {
  TranscribeJobResponse,
  TranscribeJobStatusResponse,
  VoiceCreateGoalResponse,
  VoiceCreateConfirmResponse,
  VoiceCreateFinalGoal,
  SubGoalDefinition,
  ClarifyAnswer,
} from '../types/voice'

export const voiceApi = {
  async enqueueTranscription(data: { audio: string; language: string }): Promise<TranscribeJobResponse> {
    const response = await client.post('/voice/transcribe', data)
    return response.data
  },

  async getJobStatus(jobId: string): Promise<TranscribeJobStatusResponse> {
    const response = await client.get(`/voice/transcribe/${jobId}`)
    return response.data
  },

  async waitForTranscription(
    jobId: string,
    onProgress?: (progress: number) => void,
    onElapsed?: (elapsedMs: number) => void,
    signal?: AbortSignal
  ): Promise<TranscribeJobStatusResponse> {
    const startTime = Date.now()
    const pollInterval = 2000
    const timeout = 95000

    while (true) {
      if (signal?.aborted) {
        return { status: 'failed', error: 'CANCELLED' }
      }

      const elapsed = Date.now() - startTime
      onElapsed?.(elapsed)

      if (elapsed > timeout) {
        return { status: 'failed', error: 'TRANSCRIPTION_TIMEOUT' }
      }

      try {
        const status = await this.getJobStatus(jobId)

        if (status.progress !== undefined) {
          onProgress?.(status.progress)
        }

        if (status.status === 'completed' || status.status === 'failed') {
          return status
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval))
      } catch (error) {
        if (signal?.aborted) {
          return { status: 'failed', error: 'CANCELLED' }
        }
        // On network error, wait a bit and retry
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    }
  },

  async voiceCreate(data: {
    transcript: string
    language: string
    sessionId?: string
    answers?: ClarifyAnswer[]
  }, signal?: AbortSignal): Promise<VoiceCreateGoalResponse> {
    const response = await client.post('/goals/voice-create', data, {
      signal,
      timeout: 60000,
    })
    return response.data
  },

  async voiceCreateConfirm(data: {
    goal: VoiceCreateFinalGoal
    subGoals: SubGoalDefinition[]
  }): Promise<VoiceCreateConfirmResponse> {
    const response = await client.post('/goals/voice-create/confirm', data)
    return response.data
  },
}
