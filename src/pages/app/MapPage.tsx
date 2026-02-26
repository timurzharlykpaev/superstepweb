import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Star, CheckCircle, Archive, ImageSquare, X } from '@phosphor-icons/react'
import client from '../../api/client'

interface WishItem {
  id: string
  title: string
  description?: string
  category?: string
  imageUrl?: string
  imageStatus?: 'none' | 'generating' | 'ready' | 'failed'
  status: 'active' | 'purchased' | 'archived'
  price?: number
  currency?: string
  isPurchased?: boolean
}

type Tab = 'active' | 'purchased' | 'archived'

const CATEGORY_COLORS: Record<string, string> = {
  travel: '#06B6D4', tech: '#3B82F6', health: '#10B981',
  fashion: '#EC4899', home: '#F59E0B', experience: '#8B5CF6', other: '#64748B',
}

const CATEGORIES = ['travel','tech','health','fashion','home','experience','other']

export default function MapPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('active')
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [newPrice, setNewPrice] = useState('')

  const { data: wishes = [], isLoading } = useQuery<WishItem[]>({
    queryKey: ['wishes', tab],
    queryFn: async () => {
      const res = await client.get<WishItem[]>('/wish-items', { params: { status: tab === 'active' ? undefined : tab } })
      return (res.data || []).filter(w =>
        tab === 'active' ? w.status === 'active' :
        tab === 'purchased' ? w.status === 'purchased' :
        w.status === 'archived'
      )
    },
  })

  const createMutation = useMutation({
    mutationFn: () => client.post<WishItem>('/wish-items', {
      title: newTitle,
      description: newDesc || undefined,
      category: newCategory,
      price: newPrice ? parseFloat(newPrice) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes'] })
      setShowAdd(false)
      setNewTitle('')
      setNewDesc('')
      setNewCategory('other')
      setNewPrice('')
    },
  })

  const purchaseMutation = useMutation({
    mutationFn: (id: string) => client.post(`/wish-items/${id}/purchased`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishes'] }),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => client.post(`/wish-items/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishes'] }),
  })

  const generateImageMutation = useMutation({
    mutationFn: (id: string) => client.post(`/wish-items/${id}/generate-image`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishes'] }),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => client.post(`/wish-items/${id}/restore`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishes'] }),
  })

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'active', label: 'Wishes', icon: <Star size={14} /> },
    { key: 'purchased', label: 'Got it', icon: <CheckCircle size={14} /> },
    { key: 'archived', label: 'Archived', icon: <Archive size={14} /> },
  ]

  return (
    <div className="min-h-full pb-24 md:pb-6" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="p-4 md:p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Wish Map</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your vision board</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} weight="bold" />
            Add Wish
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-surface)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-surface)' }} />
            ))}
          </div>
        ) : wishes.length === 0 ? (
          <div className="text-center py-16">
            <Star size={48} weight="duotone" className="text-yellow-400 mx-auto mb-3" />
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
              {tab === 'active' ? 'No wishes yet' : tab === 'purchased' ? 'Nothing purchased yet' : 'Nothing archived'}
            </p>
            {tab === 'active' && (
              <button onClick={() => setShowAdd(true)} className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium">
                Add First Wish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {wishes.map(wish => {
              const color = CATEGORY_COLORS[wish.category || 'other']
              return (
                <div
                  key={wish.id}
                  className="relative rounded-xl overflow-hidden group"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  {/* Image or placeholder */}
                  <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}>
                    {wish.imageUrl && wish.imageStatus === 'ready' ? (
                      <img src={wish.imageUrl} alt={wish.title} className="w-full h-full object-cover" />
                    ) : wish.imageStatus === 'generating' ? (
                      <div className="flex items-center justify-center h-full">
                        <ImageSquare size={24} className="text-purple-400 animate-pulse" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Star size={28} weight="duotone" style={{ color }} />
                      </div>
                    )}
                    {wish.status === 'purchased' && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle size={14} weight="fill" className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-sm font-medium truncate mb-1" style={{ color: 'var(--color-text)' }}>{wish.title}</p>
                    {wish.price && (
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>${wish.price}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {tab === 'active' && (
                        <>
                          <button
                            onClick={() => purchaseMutation.mutate(wish.id)}
                            className="flex-1 text-xs py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            Got it ✓
                          </button>
                          {wish.imageStatus === 'none' || !wish.imageStatus ? (
                            <button
                              onClick={() => generateImageMutation.mutate(wish.id)}
                              className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-xs"
                            >
                              🎨
                            </button>
                          ) : null}
                          <button
                            onClick={() => archiveMutation.mutate(wish.id)}
                            className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors text-xs"
                          >
                            <Archive size={12} />
                          </button>
                        </>
                      )}
                      {tab === 'archived' && (
                        <button
                          onClick={() => restoreMutation.mutate(wish.id)}
                          className="flex-1 text-xs py-1 rounded-lg bg-purple-500/20 text-purple-400"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Wish Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>✨ Add a Wish</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What do you wish for?"
              className="input mb-3"
              autoFocus
            />
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="input mb-3 resize-none"
            />
            <input
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="Price (optional)"
              type="number"
              className="input mb-3"
            />
            {/* Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
                    newCategory === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-sm text-gray-400">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newTitle.trim() || createMutation.isPending}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Wish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
