import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Crosshair, Archive, CheckCircle, ArrowRight, Spinner } from '@phosphor-icons/react'
import client from '../../api/client'
import i18n from '../../i18n'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: 'active' | 'archived' | 'completed' | 'paused'
  progress: number
  color?: string
  weight?: number
  level?: string
  startDate?: string
  endDate?: string
  subGoals?: Goal[]
}

const CATEGORY_COLORS: Record<string, string> = {
  health: '#10B981', career: '#3B82F6', education: '#8B5CF6',
  finance: '#F59E0B', relationships: '#EC4899', hobby: '#06B6D4',
  personal: '#F97316', other: '#64748B',
}

type Tab = 'active' | 'completed' | 'archived'

type CreateStep = 'input' | 'processing' | 'draft' | 'saving'

interface DraftGoal {
  title: string
  description: string
  category: string
  level: string
  color: string
  subGoals: { title: string; description: string }[]
}

const COLOR_PALETTE = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EC4899','#06B6D4','#EF4444','#F97316']
const EXAMPLES = [
  'Learn Spanish in 6 months',
  'Run a 5K race',
  'Launch my own business',
  'Read 24 books this year',
  'Get promoted at work',
  'Learn to play guitar',
]

export default function GoalsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('active')
  const [showCreate, setShowCreate] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [createStep, setCreateStep] = useState<CreateStep>('input')
  const [draft, setDraft] = useState<DraftGoal | null>(null)
  const [createError, setCreateError] = useState('')

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await client.get<Goal[]>('/goals')
      return res.data || []
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => client.post(`/goals/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => client.post(`/goals/${id}/complete`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => client.post(`/goals/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const handleAICreate = async () => {
    if (!goalText.trim()) return
    setCreateStep('processing')
    setCreateError('')
    try {
      const res = await client.post<{ goal: DraftGoal }>('/goals/voice-create', {
        text: goalText,
        language: i18n.language,
      })
      setDraft({
        ...res.data.goal,
        color: res.data.goal.color || COLOR_PALETTE[0],
      })
      setCreateStep('draft')
    } catch {
      setCreateError('Failed to analyze goal. Please try again.')
      setCreateStep('input')
    }
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    setCreateStep('saving')
    try {
      await client.post('/goals/voice-create/confirm', {
        goal: {
          title: draft.title,
          description: draft.description,
          category: draft.category,
          level: draft.level || 'global',
          color: draft.color,
        },
        subGoals: draft.subGoals,
      })
      qc.invalidateQueries({ queryKey: ['goals'] })
      setShowCreate(false)
      setGoalText('')
      setDraft(null)
      setCreateStep('input')
    } catch {
      setCreateError('Failed to save goal.')
      setCreateStep('draft')
    }
  }

  const filtered = goals.filter(g => {
    if (tab === 'active') return g.status === 'active' || g.status === 'paused'
    if (tab === 'completed') return g.status === 'completed'
    if (tab === 'archived') return g.status === 'archived'
    return false
  })

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'active', label: 'Active', icon: <Crosshair size={14} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
    { key: 'archived', label: 'Archived', icon: <Archive size={14} /> },
  ]

  return (
    <div className="min-h-full pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Goals</h1>
          <button
            onClick={() => { setShowCreate(true); setCreateStep('input') }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} weight="bold" />
            New Goal
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 md:px-6 space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Crosshair size={48} weight="duotone" className="text-purple-400 mx-auto mb-3" />
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text)' }}>No {tab} goals</p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {tab === 'active' ? 'Create your first goal with AI assistance' : `No ${tab} goals yet`}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create Goal
              </button>
            )}
          </div>
        ) : (
          filtered.map(goal => {
            const color = goal.color || CATEGORY_COLORS[goal.category] || '#64748B'
            return (
              <div
                key={goal.id}
                className="rounded-xl p-4 border border-transparent transition-all"
                style={{ backgroundColor: 'var(--color-surface)', borderLeft: `3px solid ${color}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}22`, color }}
                      >
                        {goal.category}
                      </span>
                      {goal.level && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                          {goal.level}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>
                      {goal.title}
                    </h3>
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                        <span>Progress</span>
                        <span>{goal.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress || 0}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {goal.status === 'active' && (
                      <>
                        <button
                          onClick={() => completeMutation.mutate(goal.id)}
                          className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded-lg hover:bg-green-400/10 transition-colors"
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => archiveMutation.mutate(goal.id)}
                          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          Archive
                        </button>
                      </>
                    )}
                    {(goal.status === 'archived' || goal.status === 'completed') && (
                      <button
                        onClick={() => restoreMutation.mutate(goal.id)}
                        className="text-xs text-purple-400 hover:text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-400/10 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 p-6" style={{ backgroundColor: 'var(--color-surface)' }}>

            {/* Input step */}
            {createStep === 'input' && (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>🎯 New Goal</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Describe your goal and AI will create a plan</p>
                <textarea
                  value={goalText}
                  onChange={e => setGoalText(e.target.value)}
                  placeholder="I want to learn Spanish in 6 months..."
                  rows={4}
                  className="input mb-3 resize-none"
                  autoFocus
                />
                {/* Example chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setGoalText(ex)}
                      className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                {createError && <p className="text-red-400 text-sm mb-3">{createError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowCreate(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleAICreate}
                    disabled={!goalText.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={16} />
                    Analyze with AI
                  </button>
                </div>
              </>
            )}

            {/* Processing */}
            {createStep === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Spinner size={32} className="text-purple-400 animate-spin" />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>Analyzing your goal...</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>AI is creating your personalized plan</p>
              </div>
            )}

            {/* Draft */}
            {createStep === 'draft' && draft && (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>✨ Your Goal Plan</h3>
                <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{draft.title}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{draft.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">{draft.category}</span>
                    {draft.level && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{draft.level}</span>}
                  </div>
                </div>
                {draft.subGoals?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>SUB-GOALS</p>
                    <div className="space-y-2">
                      {draft.subGoals.map((sg, i) => (
                        <div key={i} className="flex gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                          <CheckCircle size={16} weight="fill" className="text-green-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm" style={{ color: 'var(--color-text)' }}>{sg.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Color picker */}
                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>COLOR</p>
                  <div className="flex gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => setDraft(d => d ? { ...d, color: c } : d)}
                        className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: c, outline: draft.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                      />
                    ))}
                  </div>
                </div>
                {createError && <p className="text-red-400 text-sm mb-3">{createError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setCreateStep('input')} className="flex-1 border border-white/10 py-3 rounded-xl text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    ← Edit
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Save Goal
                  </button>
                </div>
              </>
            )}

            {createStep === 'saving' && (
              <div className="text-center py-8">
                <Spinner size={32} className="text-purple-400 animate-spin mx-auto mb-4" />
                <p style={{ color: 'var(--color-text)' }}>Saving your goal...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
