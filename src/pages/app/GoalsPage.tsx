import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, createGoal, deleteGoal, type Goal } from '../../api/goals'
import { useGoalsStore } from '../../store/goalsStore'

const LEVELS = ['global', 'monthly', 'weekly']

const CATEGORY_COLORS: Record<string, string> = {
  health: '#10B981',
  career: '#3B82F6',
  education: '#8B5CF6',
  finance: '#F59E0B',
  relationships: '#EC4899',
  hobby: '#06B6D4',
  other: '#64748B',
}

export default function GoalsPage() {
  const qc = useQueryClient()
  const setGoals = useGoalsStore((s) => s.setGoals)
  const goals = useGoalsStore((s) => s.goals)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ global: true })
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [newLevel, setNewLevel] = useState('global')

  useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await getGoals()
      setGoals(res.data.goals)
      return res.data.goals
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createGoal({ title: newTitle, category: newCategory, level: newLevel } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setShowModal(false)
      setNewTitle('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  const grouped = LEVELS.reduce<Record<string, Goal[]>>((acc, level) => {
    acc[level] = goals.filter((g) => (g.level || 'global') === level)
    return acc
  }, {})

  const toggleSection = (level: string) =>
    setExpanded((prev) => ({ ...prev, [level]: !prev[level] }))

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Goals</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Add Goal
        </button>
      </div>

      {/* Grouped sections */}
      <div className="space-y-4">
        {LEVELS.map((level) => (
          <div key={level} className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => toggleSection(level)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold capitalize">{level}</span>
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                  {grouped[level].length}
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${expanded[level] ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Goals list */}
            {expanded[level] && (
              <div className="border-t border-white/5">
                {grouped[level].length === 0 ? (
                  <p className="text-gray-500 text-sm px-5 py-4">No {level} goals yet</p>
                ) : (
                  grouped[level].map((goal) => {
                    const color = goal.color || CATEGORY_COLORS[goal.category] || '#64748B'
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center gap-4 px-5 py-4 border-t border-white/5 first:border-t-0 hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{goal.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{goal.category}</span>
                            <span className="text-xs text-gray-600">·</span>
                            <span className="text-xs text-gray-500">{goal.progress || 0}%</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${goal.progress || 0}%`, background: color }}
                          />
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => deleteMutation.mutate(goal.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">New Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="input"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input">
                    {Object.keys(CATEGORY_COLORS).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Level</label>
                  <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="input">
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl transition-colors hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!newTitle.trim() || createMutation.isPending}
                  className="flex-1 btn-primary py-3 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
