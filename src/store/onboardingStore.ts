import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  isCompleted: boolean
  goalText: string
  parsedGoal: any
  setCompleted: (v: boolean) => void
  setGoalText: (t: string) => void
  setParsedGoal: (g: any) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      isCompleted: false,
      goalText: '',
      parsedGoal: null,
      setCompleted: (v) => set({ isCompleted: v }),
      setGoalText: (t) => set({ goalText: t }),
      setParsedGoal: (g) => set({ parsedGoal: g }),
      reset: () => set({ isCompleted: false, goalText: '', parsedGoal: null }),
    }),
    { name: 'onboarding-v1', partialize: (s) => ({ isCompleted: s.isCompleted }) }
  )
)
