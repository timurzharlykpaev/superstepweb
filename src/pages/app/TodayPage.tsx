import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGoals, createGoal } from '../../api/goals'
import { useGoalsStore } from '../../store/goalsStore'
const CATEGORY_COLORS: Record<string, string> = {
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
  const setGoals = useGoalsStore((s) => s.setGoals)
  const goals = useGoalsStore((s) => s.goals)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('other')

  const { isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await getGoals()
      setGoals(res.data.goals)
      return res.data.goals
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createGoal({
        title: newTitle,
        category: newCategory,
        status: 'active',
        progress: 0,
        weight: 3,
      } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setShowModal(false)
      setNewTitle('')
    },
  })

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{today}</p>
        <h1 className="text-2xl font-bold text-white">Today's Goals</h1>
      </div>

      {/* Goals grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🎯</span>
          <h3 className="text-white text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first goal to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-3 rounded-xl"
          >
            Add Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const color = goal.color || CATEGORY_COLORS[goal.category] || '#64748B'
            return (
              <div
                key={goal.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: color,
                    clipPath: `inset(0 ${100 - (goal.progress || 0)}% 0 0)`,
                  }}
                />

                <div className="relative">
                  <div
                    className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3"
                    style={{ background: `${color}22`, color }}
                  >
                    {goal.category}
                  </div>
                  <h3 className="text-white font-medium text-sm leading-snug mb-3 line-clamp-2">
                    {goal.title}
                  </h3>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${goal.progress || 0}%`, background: color }}
                      />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="flex gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-sm"
                        style={{ background: i < (goal.weight || 3) ? color : '#333' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-colors z-40"
        title="Add goal"
      >
        +
      </button>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">Add New Goal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input"
                >
                  {Object.keys(CATEGORY_COLORS).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-white/10 text-gray-400 hover:text-white py-3 rounded-xl transition-colors"
                >
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
