import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Square, CalendarDots, Lightning } from '@phosphor-icons/react'
import client from '../../api/client'

interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed' | 'skipped'
  scheduledDate?: string
  goalId?: string
  goal?: { title: string; color?: string; category?: string }
  estimatedMinutes?: number
  priority?: number
}

const STATUS_COLORS: Record<string, string> = {
  health: '#10B981',
  career: '#3B82F6',
  education: '#8B5CF6',
  finance: '#F59E0B',
  relationships: '#EC4899',
  hobby: '#06B6D4',
  other: '#64748B',
}

export default function TodayPage() {
  const qc = useQueryClient()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-today'],
    queryFn: async () => {
      const res = await client.get<Task[]>('/tasks/today')
      return res.data || []
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => client.patch(`/tasks/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-today'] }),
  })

  const skipMutation = useMutation({
    mutationFn: (id: string) => client.patch(`/tasks/${id}/skip`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks-today'] }),
  })

  const pending = tasks.filter((t) => t.status === 'pending')
  const completed = tasks.filter((t) => t.status === 'completed')

  const progress = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0

  return (
    <div className="min-h-full p-4 md:p-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Today's Tasks</h1>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-black/5 dark:border-white/5" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightning size={16} weight="fill" className="text-purple-400" />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Daily Progress</span>
            </div>
            <span className="text-sm font-bold text-purple-400">{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {completed.length} of {tasks.length} tasks completed
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-purple-500/10">
            <CalendarDots size={36} weight="duotone" className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No tasks for today</h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
            Complete onboarding to get a personalized daily plan, or add goals first.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pending tasks */}
          {pending.map((task) => {
            const color = task.goal?.color || STATUS_COLORS[task.goal?.category || 'other']
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-black/5 dark:border-white/5 transition-all group"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <button
                  onClick={() => completeMutation.mutate(task.id)}
                  className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-purple-400 transition-colors"
                  disabled={completeMutation.isPending}
                >
                  <Square size={22} weight="regular" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{task.title}</p>
                  {task.description && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{task.description}</p>
                  )}
                  {task.goal && (
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full mt-1.5"
                      style={{ background: `${color}22`, color }}
                    >
                      {task.goal.title}
                    </span>
                  )}
                </div>
                {task.estimatedMinutes && (
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    {task.estimatedMinutes}m
                  </span>
                )}
                <button
                  onClick={() => skipMutation.mutate(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Skip
                </button>
              </div>
            )
          })}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>
                COMPLETED ({completed.length})
              </p>
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl mb-2 opacity-60"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <CheckSquare size={22} weight="fill" className="text-green-400 flex-shrink-0" />
                  <p className="text-sm line-through flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {task.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
