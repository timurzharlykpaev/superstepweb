export interface ClarifyQuestion {
  id: string
  question: string
  type?: 'text' | 'number' | 'choice'
  choices?: string[]
  placeholder?: string
}

export interface ClarifyAnswer {
  questionId: string
  answer: string
}

export interface SubGoalDefinition {
  title: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  frequencyValue?: number
  reminderTime?: string
  daysOfWeek?: number[]
}

export interface VoiceCreateFinalGoal {
  title: string
  description?: string
  emoji?: string
  category?: string
  startDate?: string
  endDate?: string
  weight?: 1 | 2 | 3 | 4 | 5
  color?: string
}

export interface VoiceCreateClarifyResponse {
  stage: 'clarifying'
  sessionId: string
  questions: ClarifyQuestion[]
  currentRound: number
  maxRounds: number
  summary?: string
}

export interface VoiceCreateFinalResponse {
  stage: 'final'
  sessionId?: string
  goal: VoiceCreateFinalGoal
  subGoals: SubGoalDefinition[]
  motivationalMessage: string
}

export type VoiceCreateGoalResponse = VoiceCreateClarifyResponse | VoiceCreateFinalResponse

export interface TranscribeJobResponse {
  jobId: string
}

export interface TranscribeJobStatusResponse {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  result?: { text: string }
  error?: string
}

export interface VoiceCreateConfirmResponse {
  goalId: string
  subGoalsCreated: number
  tasksCreated: number
}

export interface OnboardResult {
  goals: Array<{
    id: string
    title: string
    emoji: string
    habits: Array<{
      id: string
      title: string
      frequency: string
      frequencyValue: number
    }>
  }>
  tasksCreated: number
  motivationalMessage?: string
}
