import client from './client'

export interface Goal {
  id: string
  title: string
  description?: string
  category: string
  level?: string
  progress: number
  weight: number
  color?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Plan {
  id: string
  weekStart: string
  intensity: string
  focusGoalIds: string[]
}

export const getGoals = () =>
  client.get<{ goals: Goal[] }>('/goals')

export const createGoal = (data: Partial<Goal>) =>
  client.post<{ goal: Goal }>('/goals', data)

export const updateGoal = (id: string, data: Partial<Goal>) =>
  client.patch<{ goal: Goal }>(`/goals/${id}`, data)

export const deleteGoal = (id: string) =>
  client.delete(`/goals/${id}`)

export const getPlans = () =>
  client.get<{ plans: Plan[] }>('/plans')
