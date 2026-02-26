import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, CalendarBlank, Target, User } from '@phosphor-icons/react'
import client from '../../api/client'

interface GoalCube {
  id: string
  title: string
  emoji?: string
  color: string
  weight: number
  progress: number
  category: string
  status: string
}

interface GoalTreeNode {
  id: string
  title: string
  emoji?: string
  color: string
  weight: number
  progress: number
  status: string
  parentId: string | null
  children?: GoalTreeNode[]
}

interface UserInfo {
  nickname?: string
  avatarUrl?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HomePage() {
  const navigate = useNavigate()
  const greeting = useMemo(() => getGreeting(), [])

  const { data: cubes = [], isLoading: cubesLoading } = useQuery<GoalCube[]>({
    queryKey: ['goal-cubes'],
    queryFn: async () => {
      const res = await client.get<GoalCube[]>('/goals/cubes')
      return res.data || []
    },
  })

  const { data: tree = [], isLoading: treeLoading } = useQuery<GoalTreeNode[]>({
    queryKey: ['goal-tree'],
    queryFn: async () => {
      const res = await client.get<{ goals: GoalTreeNode[] }>('/goals/tree')
      return res.data?.goals || []
    },
  })

  const { data: user } = useQuery<UserInfo>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await client.get<UserInfo>('/auth/me')
      return res.data || {}
    },
  })

  const renderAvatarOrEmoji = () => {
    if (user?.avatarUrl?.startsWith('http')) {
      return (
        <img
          src={user.avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    } else if (user?.avatarUrl?.startsWith('emoji:')) {
      const emoji = decodeURIComponent(user.avatarUrl.replace('emoji:', ''))
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
          {emoji}
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
          <User size={18} weight="bold" className="text-white" />
        </div>
      )
    }
  }

  // Empty state
  if (!cubesLoading && !treeLoading && cubes.length === 0 && tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6" style={{ backgroundColor: 'var(--color-background)' }}>
        <Target size={64} weight="duotone" className="text-purple-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>No goals yet</h2>
        <p className="text-center mb-6 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          Start your journey by creating your first goal
        </p>
        <button
          onClick={() => navigate('/app/goals')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus size={20} weight="bold" />
          Create Goal
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6">
          {renderAvatarOrEmoji()}
          <div className="flex-1">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{greeting}</p>
            {user?.nickname && (
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{user.nickname}</h2>
            )}
          </div>
        </div>

        {/* Goal Cubes */}
        {cubes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Your Goals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cubes.map((cube) => {
                const size = cube.weight === 1 ? 'h-20' : cube.weight === 2 ? 'h-24' : 'h-28'
                return (
                  <button
                    key={cube.id}
                    onClick={() => navigate(`/app/goals/${cube.id}`)}
                    className={`rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${size}`}
                    style={{ backgroundColor: cube.color || '#8b5cf6', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  >
                    {cube.emoji && <span className="text-2xl mb-1">{cube.emoji}</span>}
                    <span className="text-white font-semibold text-xs line-clamp-2">{cube.title}</span>
                    <span className="text-white/80 text-xs mt-1">{Math.round(cube.progress || 0)}%</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Goal Tree */}
        {tree.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Goal Hierarchy
            </h3>
            <div className="space-y-3">
              {tree.map((node) => renderTreeNode(node, navigate))}
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {(cubesLoading || treeLoading) && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex gap-3 md:hidden" style={{ backgroundColor: 'var(--color-background)', borderTop: '1px solid var(--color-surface)' }}>
        <button
          onClick={() => navigate('/app/today')}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-colors bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg"
        >
          <CalendarBlank size={18} weight="bold" />
          Today
        </button>
        <button
          onClick={() => navigate('/app/goals')}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-colors bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
        >
          <Plus size={18} weight="bold" />
          New Goal
        </button>
      </div>
    </div>
  )
}

function renderTreeNode(node: GoalTreeNode, navigate: (path: string) => void, level: number = 0) {
  return (
    <div key={node.id} style={{ marginLeft: level * 16 }}>
      <button
        onClick={() => navigate(`/app/goals/${node.id}`)}
        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-opacity-80"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: node.color || '#8b5cf6' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {node.emoji && <span className="text-sm">{node.emoji}</span>}
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
              {node.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${node.progress || 0}%`, backgroundColor: node.color || '#8b5cf6' }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{Math.round(node.progress || 0)}%</span>
          </div>
        </div>
      </button>
      {node.children?.map((child) => renderTreeNode(child, navigate, level + 1))}
    </div>
  )
}
