import { create } from 'zustand'
import type { Goal, Plan } from '../api/goals'

interface GoalsState {
  goals: Goal[]
  plans: Plan[]
  setGoals: (goals: Goal[]) => void
  setPlans: (plans: Plan[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, data: Partial<Goal>) => void
  removeGoal: (id: string) => void
}

export const useGoalsStore = create<GoalsState>((set) => ({
  goals: [],
  plans: [],

  setGoals: (goals) => set({ goals }),
  setPlans: (plans) => set({ plans }),

  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),

  updateGoal: (id, data) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
    })),

  removeGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
}))
