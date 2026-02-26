import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PencilSimple, Check, Clock, Trash, Plus, CheckCircle, Pause, Play } from '@phosphor-icons/react'
import client from '../../api/client'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: 'active' | 'archived' | 'completed' | 'paused'
  progress: number
  currentValue?: number
  targetValue?: number
  color?: string
  weight?: number
  startDate?: string
  endDate?: string
  whyText?: string
}

interface GoalInstance {
  id: string
  goalId: string
  goalTitle: string
  date: string
  status: 'pending' | 'completed' | 'skipped'
  scheduledTime?: string
  plannedValue: number
  doneValue: number
}

interface Habit {
  id: string
  goalId: string
  title: string
  frequency: 'daily' | 'weekly' | 'monthly'
  frequencyType?: 'daily' | 'weekly' | 'monthly'
  weekDays?: number[]
  daysOfWeek?: number[]
  reminderTime?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#10B981',
  career: '#3B82F6',
  education: '#8B5CF6',
  finance: '#F59E0B',
  relationships: '#EC4899',
  hobby: '#06B6D4',
  personal: '#F97316',
  other: '#64748B',
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingInstance, setEditingInstance] = useState<GoalInstance | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editTime, setEditTime] = useState('')

  // Fetch goal
  const { data: goal, isLoading: goalLoading } = useQuery<Goal>({
    queryKey: ['goal', id],
    queryFn: async () => {
      const res = await client.get<Goal>(`/goals/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  // Fetch today's instances
  const today = new Date().toISOString().split('T')[0]
  const { data: instances = [], refetch: refetchInstances } = useQuery<GoalInstance[]>({
    queryKey: ['goal-instances', id, today],
    queryFn: async () => {
      try {
        const res = await client.get<GoalInstance[]>(`/goals/${id}/instances`, { params: { date: today } })
        return res.data || []
      } catch {
        return []
      }
    },
    enabled: !!id && goal?.status === 'active',
  })

  // Fetch habits
  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['goal-habits', id],
    queryFn: async () => {
      try {
        const res = await client.get<Habit[]>(`/goals/${id}/habits`)
        return res.data || []
      } catch {
        return []
      }
    },
    enabled: !!id && goal?.status === 'active',
  })

  // Toggle instance completion
  const toggleMutation = useMutation({
    mutationFn: (instanceId: string) => client.post(`/goals/instances/${instanceId}/toggle`),
    onSuccess: () => {
      refetchInstances()
      qc.invalidateQueries({ queryKey: ['goal', id] })
    },
  })

  // Update instance
  const updateInstanceMutation = useMutation({
    mutationFn: (data: { instanceId: string; title: string; scheduledTime?: string }) =>
      client.patch(`/goals/instances/${data.instanceId}`, {
        title: data.title,
        scheduledTime: data.scheduledTime || undefined,
      }),
    onSuccess: () => {
      refetchInstances()
      setShowEditModal(false)
      setEditingInstance(null)
    },
  })

  // Delete instance
  const deleteInstanceMutation = useMutation({
    mutationFn: (instanceId: string) => client.delete(`/goals/instances/${instanceId}`),
    onSuccess: () => {
      refetchInstances()
      qc.invalidateQueries({ queryKey: ['goal', id] })
    },
  })

  // Add instance
  const addInstanceMutation = useMutation({
    mutationFn: (data: { goalId: string; date: string; title: string; scheduledTime?: string }) =>
      client.post('/goals/instances', data),
    onSuccess: () => {
      refetchInstances()
      qc.invalidateQueries({ queryKey: ['goal', id] })
      setShowAddModal(false)
      setNewTaskTitle('')
      setNewTaskTime('')
    },
  })

  // Goal actions
  const archiveMutation = useMutation({
    mutationFn: () => client.post(`/goals/${id}/archive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goal', id] })
      navigate('/app/goals')
    },
  })

  const completeMutation = useMutation({
    mutationFn: () => client.post(`/goals/${id}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goal', id] })
      navigate('/app/goals')
    },
  })

  const pauseMutation = useMutation({
    mutationFn: () => client.post(`/goals/${id}/pause`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goal', id] }),
  })

  const resumeMutation = useMutation({
    mutationFn: () => client.post(`/goals/${id}/resume`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goal', id] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => client.delete(`/goals/${id}`),
    onSuccess: () => navigate('/app/goals'),
  })

  const openEditModal = useCallback((inst: GoalInstance) => {
    setEditingInstance(inst)
    setEditTitle(inst.goalTitle)
    setEditTime(inst.scheduledTime || '')
    setShowEditModal(true)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (!editingInstance || !editTitle.trim()) return
    updateInstanceMutation.mutate({
      instanceId: editingInstance.id,
      title: editTitle.trim(),
      scheduledTime: editTime || undefined,
    })
  }, [editingInstance, editTitle, editTime, updateInstanceMutation])

  const handleAddTask = useCallback(() => {
    if (!id || !newTaskTitle.trim()) return
    addInstanceMutation.mutate({
      goalId: id,
      date: today,
      title: newTaskTitle.trim(),
      scheduledTime: newTaskTime || undefined,
    })
  }, [id, newTaskTitle, newTaskTime, today, addInstanceMutation])

  const handleDeleteInstance = useCallback((instanceId: string) => {
    if (confirm('Delete this task?')) {
      deleteInstanceMutation.mutate(instanceId)
    }
  }, [deleteInstanceMutation])

  const formatTime = (time?: string): string => {
    if (!time) return ''
    return time.substring(0, 5) // HH:MM:SS → HH:MM
  }

  const formatHabitSchedule = (habit: Habit): string => {
    const freq = habit.frequency || habit.frequencyType
    const days: number[] | null = habit.weekDays || habit.daysOfWeek || null

    if (freq === 'daily') return 'Daily'
    if (freq === 'weekly' && days && days.length > 0) {
      return days.map((d) => DAYS_OF_WEEK[d]).join(', ')
    }
    return 'Weekly'
  }

  const formatProgress = (g: Goal): string => {
    if (!g.targetValue || g.targetValue === 0) return '0%'
    const pct = Math.min(Math.round(((g.currentValue || 0) / g.targetValue) * 100), 100)
    return isNaN(pct) ? '0%' : `${pct}%`
  }

  const getProgressPercent = (g: Goal): number => {
    if (!g.targetValue || g.targetValue === 0) return 0
    const pct = Math.min(((g.currentValue || 0) / g.targetValue) * 100, 100)
    return isNaN(pct) ? 0 : pct
  }

  if (goalLoading || !goal) {
    return (
      <div className="flex items-center justify-center min-h-full" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  const categoryColor = goal.color || CATEGORY_COLORS[goal.category] || '#64748B'
  const progressPercent = getProgressPercent(goal)
  const isCompleted = goal.status === 'completed'
  const isArchived = goal.status === 'archived'
  const isPaused = goal.status === 'paused'
  const isActive = goal.status === 'active' || isPaused

  return (
    <div className="min-h-full pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b" style={{ borderColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/app/goals')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
          </button>
          <h1 className="text-xl font-bold flex-1" style={{ color: 'var(--color-text)' }}>{goal.title}</h1>
          {isActive && (
            <button
              onClick={() => {
                if (confirm('Archive this goal?')) {
                  archiveMutation.mutate()
                }
              }}
              className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-400/10 transition-colors"
            >
              Archive
            </button>
          )}
        </div>

        {/* Status Badge */}
        {(isCompleted || isArchived || isPaused) && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: isCompleted ? '#10B98120' : isArchived ? '#64748B20' : '#F59E0B20',
                color: isCompleted ? '#10B981' : isArchived ? '#64748B' : '#F59E0B',
              }}
            >
              {isCompleted ? 'Completed' : isArchived ? 'Archived' : 'Paused'}
            </span>
          </div>
        )}

        {/* Category */}
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>
          {goal.category}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Why Text */}
        {goal.whyText && (
          <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Why
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--color-text)' }}>{goal.whyText}</p>
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Progress</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{formatProgress(goal)}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%`, backgroundColor: categoryColor }}
            />
          </div>
        </div>

        {/* Today's Tasks */}
        {isActive && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Today's Tasks</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-purple-400 hover:bg-purple-400/10 transition-colors"
              >
                <Plus size={14} weight="bold" />
                Add Task
              </button>
            </div>
            {instances.length > 0 ? (
              <div className="space-y-2">
                {instances.map((inst) => {
                  const isDone = inst.status === 'completed'
                  return (
                    <div
                      key={inst.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                      <button
                        onClick={() => toggleMutation.mutate(inst.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDone ? 'bg-green-500 border-green-500' : 'border-gray-400'
                        }`}
                      >
                        {isDone && <Check size={12} weight="bold" className="text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDone ? 'line-through opacity-60' : ''}`} style={{ color: 'var(--color-text)' }}>
                          {inst.goalTitle}
                        </p>
                        {inst.scheduledTime && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock size={10} />
                            {formatTime(inst.scheduledTime)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openEditModal(inst)}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                      >
                        <PencilSimple size={16} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteInstance(inst.id)}
                        className="p-1 rounded-lg hover:bg-red-400/10 transition-colors flex-shrink-0"
                      >
                        <Trash size={16} className="text-red-400" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-muted)' }}>
                No tasks today
              </p>
            )}
          </div>
        )}

        {/* Recurring Plan (Habits) */}
        {isActive && habits.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Recurring Plan</h3>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: categoryColor }} />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-0.5" style={{ color: 'var(--color-text)' }}>
                      {habit.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {formatHabitSchedule(habit)}
                      {habit.reminderTime && ` · ${formatTime(habit.reminderTime)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Start Date</p>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              {goal.startDate ? new Date(goal.startDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>End Date</p>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="space-y-3 pt-4">
            <div className="flex gap-3">
              <button
                onClick={() => (isPaused ? resumeMutation.mutate() : pauseMutation.mutate())}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-colors"
                style={{ borderColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                {isPaused ? <Play size={16} weight="bold" /> : <Pause size={16} weight="bold" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={() => {
                  if (confirm('Mark this goal as complete?')) {
                    completeMutation.mutate()
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white transition-colors"
                style={{ backgroundColor: categoryColor }}
              >
                <CheckCircle size={16} weight="bold" />
                Complete
              </button>
            </div>
            <button
              onClick={() => {
                if (confirm('Delete this goal? This cannot be undone.')) {
                  deleteMutation.mutate()
                }
              }}
              className="w-full py-3 rounded-xl border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors font-medium"
            >
              Delete Goal
            </button>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {showEditModal && editingInstance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-t-2xl md:rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Edit Task</h3>

            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Task Name
            </label>
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task name..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 mb-4 border outline-none focus:border-purple-500 transition-colors resize-none"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-surface-2)' }}
              autoFocus
            />

            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Scheduled Time
            </label>
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full rounded-xl px-4 py-3 mb-6 border outline-none focus:border-purple-500 transition-colors"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-surface-2)' }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingInstance(null)
                }}
                className="flex-1 py-3 rounded-xl border transition-colors"
                style={{ borderColor: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle.trim() || updateInstanceMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-40"
              >
                {updateInstanceMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-t-2xl md:rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Add Task</h3>

            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Task Name
            </label>
            <textarea
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 mb-4 border outline-none focus:border-purple-500 transition-colors resize-none"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-surface-2)' }}
              autoFocus
            />

            <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Scheduled Time
            </label>
            <input
              type="time"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-full rounded-xl px-4 py-3 mb-6 border outline-none focus:border-purple-500 transition-colors"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-surface-2)' }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewTaskTitle('')
                  setNewTaskTime('')
                }}
                className="flex-1 py-3 rounded-xl border transition-colors"
                style={{ borderColor: 'var(--color-surface-2)', color: 'var(--color-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || addInstanceMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-40"
              >
                {addInstanceMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
