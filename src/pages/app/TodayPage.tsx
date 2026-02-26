import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Square, CalendarDots, Flame, Trophy, Plus } from '@phosphor-icons/react'
import client from '../../api/client'
// removed

interface Instance {
  id: string
  goalId: string
  goalTitle: string
  goalColor: string | null
  date: string
  plannedValue: number
  doneValue: number
  status: 'pending' | 'done' | 'skipped' | 'partial'
  scheduledTime?: string
  notes?: string
}

interface TodayData {
  date: string
  instances: Instance[]
  completedCount: number
  totalCount: number
  streak: number
}

export default function TodayPage() {
  const qc = useQueryClient()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const { data, isLoading } = useQuery<TodayData>({
    queryKey: ['instances-today'],
    queryFn: async () => {
      const res = await client.get<TodayData>('/goals/instances/today')
      return res.data
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => client.post(`/goals/instances/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['instances-today'] }),
  })

  const instances = data?.instances || []
  const completedCount = data?.completedCount || 0
  const totalCount = data?.totalCount || 0
  const streak = data?.streak || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const pending = instances.filter(i => i.status === 'pending')
  const done = instances.filter(i => i.status === 'done')

  return (
    <div className="min-h-full p-4 md:p-6 pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{greeting} 👋</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame size={16} weight="fill" className="text-orange-400" />
            <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{streak}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Day streak</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={16} weight="fill" className="text-yellow-400" />
            <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{completedCount}/{totalCount}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Completed</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <span className="text-xl font-bold text-purple-400">{progress}%</span>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Progress</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))}
        </div>
      ) : instances.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-purple-500/10">
            <CalendarDots size={36} weight="duotone" className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>No tasks for today</h3>
          <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
            Complete onboarding to generate your daily plan, or create goals first.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pending */}
          {pending.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center gap-3 p-4 rounded-xl border border-transparent hover:border-purple-500/20 transition-all group"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <button
                onClick={() => toggleMutation.mutate(inst.id)}
                disabled={toggleMutation.isPending}
                className="flex-shrink-0 transition-colors text-gray-400 hover:text-purple-400"
              >
                <Square size={22} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  {inst.goalTitle}
                </p>
                {inst.scheduledTime && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{inst.scheduledTime}</p>
                )}
              </div>
              {inst.goalColor && (
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: inst.goalColor }} />
              )}
            </div>
          ))}

          {/* Done */}
          {done.length > 0 && (
            <>
              <p className="text-xs font-semibold pt-2 pb-1 px-1" style={{ color: 'var(--color-text-muted)' }}>
                DONE ({done.length})
              </p>
              {done.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-3 p-4 rounded-xl opacity-50 cursor-pointer"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  onClick={() => toggleMutation.mutate(inst.id)}
                >
                  <CheckSquare size={22} weight="fill" className="text-green-400 flex-shrink-0" />
                  <p className="text-sm line-through flex-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {inst.goalTitle}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* FAB — generate daily plan */}
      {instances.length === 0 && !isLoading && (
        <button
          onClick={() => client.post('/goals/instances/generate-daily').then(() => qc.invalidateQueries({ queryKey: ['instances-today'] }))}
          className="fixed bottom-24 md:bottom-8 right-6 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition-colors z-40"
        >
          <Plus size={18} weight="bold" />
          Generate Today's Plan
        </button>
      )}
    </div>
  )
}
