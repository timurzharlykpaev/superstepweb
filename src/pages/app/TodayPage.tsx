import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Square, CalendarDots, Flame, Trophy, Plus, Confetti } from '@phosphor-icons/react'
import client from '../../api/client'

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

interface DayStats {
  date: string
  completedCount: number
  totalCount: number
  progress: number
}

type ViewMode = 'today' | 'week' | 'month'

export default function TodayPage() {
  const qc = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('today')

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

  const { data: weekStats = [] } = useQuery<DayStats[]>({
    queryKey: ['instances-week'],
    queryFn: async () => {
      const res = await client.get<DayStats[]>('/goals/instances/week')
      return res.data || []
    },
    enabled: viewMode === 'week',
  })

  const { data: monthStats = [] } = useQuery<DayStats[]>({
    queryKey: ['instances-month'],
    queryFn: async () => {
      const res = await client.get<DayStats[]>('/goals/instances/month')
      return res.data || []
    },
    enabled: viewMode === 'month',
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
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <div className="min-h-full p-4 md:p-6 pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{today}</p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{greeting} 👋</h1>
      </div>

      {/* Segment Control */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <button
          onClick={() => setViewMode('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'today' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'week' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'month' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Month
        </button>
      </div>

      {viewMode === 'today' && (
        <>
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

          {/* Celebration card */}
          {allDone && (
            <div className="mb-6 rounded-2xl p-6 text-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30">
              <Confetti size={48} weight="duotone" className="text-yellow-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>All done for today! 🎉</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Great job staying on track!</p>
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
        </>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          {weekStats.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDots size={48} weight="duotone" className="text-purple-400 mx-auto mb-3" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No data for this week</p>
            </div>
          ) : (
            weekStats.map((day) => {
              const dayDate = new Date(day.date)
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNum = dayDate.getDate()
              const isToday = day.date === new Date().toISOString().split('T')[0]

              return (
                <div
                  key={day.date}
                  className={`rounded-xl p-4 border ${isToday ? 'border-purple-500/50 bg-purple-500/10' : 'border-transparent'}`}
                  style={{ backgroundColor: isToday ? undefined : 'var(--color-surface)' }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{dayName}</p>
                      <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{dayNum}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {day.completedCount}/{day.totalCount} tasks
                        </span>
                        <span className="text-sm font-bold text-purple-400">{Math.round(day.progress)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${day.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--color-text-muted)' }}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthStats.length === 0 ? (
              <div className="col-span-7 text-center py-20">
                <CalendarDots size={48} weight="duotone" className="text-purple-400 mx-auto mb-3" />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No data for this month</p>
              </div>
            ) : (
              monthStats.map((day) => {
                const dayDate = new Date(day.date)
                const dayNum = dayDate.getDate()
                const isToday = day.date === new Date().toISOString().split('T')[0]
                const hasData = day.totalCount > 0
                const isDone = hasData && day.completedCount === day.totalCount

                return (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-xl p-2 text-center flex flex-col items-center justify-center transition-all ${
                      isToday ? 'ring-2 ring-purple-500' : ''
                    }`}
                    style={{
                      backgroundColor: !hasData ? 'var(--color-surface)' :
                                      isDone ? '#10B98150' :
                                      day.progress > 50 ? '#8B5CF650' : '#8B5CF630'
                    }}
                  >
                    <p className={`text-sm font-semibold ${isToday ? 'text-purple-400' : ''}`} style={{ color: isToday ? undefined : 'var(--color-text)' }}>
                      {dayNum}
                    </p>
                    {hasData && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {isDone ? '✓' : `${day.completedCount}/${day.totalCount}`}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* FAB — generate daily plan */}
      {viewMode === 'today' && instances.length === 0 && !isLoading && (
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
