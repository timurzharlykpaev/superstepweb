import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Star, CheckCircle, Archive, ImageSquare, X, Crown, Trash, PencilSimple } from '@phosphor-icons/react'
import client from '../../api/client'
import { getSubscription } from '../../api/subscriptions'

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

const FREE_TIER_LIMITS = {
  maxWishes: 10,
  maxImages: 3,
}

export default function MapPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('active')
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedWish, setSelectedWish] = useState<WishItem | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCategory, setNewCategory] = useState('other')
  const [newPrice, setNewPrice] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCategory, setEditCategory] = useState('other')
  const [editPrice, setEditPrice] = useState('')

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WishItem> }) => client.patch(`/wish-items/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes'] })
      setShowDetail(false)
      setSelectedWish(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.delete(`/wish-items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes'] })
      setShowDetail(false)
      setSelectedWish(null)
    },
  })

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await getSubscription()
      return res.data
    },
  })

  const isPro = sub?.status === 'active' || sub?.status === 'trialing'
  const totalWishes = wishes.length
  const wishesWithImages = wishes.filter(w => w.imageStatus === 'ready').length

  const handleOpenDetail = (wish: WishItem) => {
    setSelectedWish(wish)
    setEditTitle(wish.title)
    setEditDesc(wish.description || '')
    setEditCategory(wish.category || 'other')
    setEditPrice(wish.price?.toString() || '')
    setShowDetail(true)
  }

  const handleUpdateWish = () => {
    if (!selectedWish || !editTitle.trim()) return
    updateMutation.mutate({
      id: selectedWish.id,
      data: {
        title: editTitle,
        description: editDesc || undefined,
        category: editCategory,
        price: editPrice ? parseFloat(editPrice) : undefined,
      },
    })
  }

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

        {/* Free tier limits banner */}
        {!isPro && tab === 'active' && (
          <div className="mb-4 rounded-xl p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
            <div className="flex items-start gap-3">
              <Crown size={20} weight="fill" className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Free Plan Limits</p>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Wishes: {totalWishes}/{FREE_TIER_LIMITS.maxWishes} • AI Images: {wishesWithImages}/{FREE_TIER_LIMITS.maxImages}
                </p>
                <button className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}
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
                  className="relative rounded-xl overflow-hidden group cursor-pointer"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                  onClick={() => handleOpenDetail(wish)}
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
                            onClick={(e) => { e.stopPropagation(); purchaseMutation.mutate(wish.id) }}
                            className="flex-1 text-xs py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          >
                            Got it ✓
                          </button>
                          {wish.imageStatus === 'none' || !wish.imageStatus ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); generateImageMutation.mutate(wish.id) }}
                              className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-xs"
                            >
                              🎨
                            </button>
                          ) : null}
                          <button
                            onClick={(e) => { e.stopPropagation(); archiveMutation.mutate(wish.id) }}
                            className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors text-xs"
                          >
                            <Archive size={12} />
                          </button>
                        </>
                      )}
                      {tab === 'archived' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); restoreMutation.mutate(wish.id) }}
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

      {/* Detail/Edit Wish Modal */}
      {showDetail && selectedWish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                <PencilSimple size={18} className="inline mr-2" />
                Edit Wish
              </h3>
              <button onClick={() => setShowDetail(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            {/* Image preview */}
            {selectedWish.imageUrl && selectedWish.imageStatus === 'ready' && (
              <div className="mb-4 rounded-xl overflow-hidden h-32">
                <img src={selectedWish.imageUrl} alt={selectedWish.title} className="w-full h-full object-cover" />
              </div>
            )}

            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Wish title"
              className="input mb-3"
              autoFocus
            />
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="input mb-3 resize-none"
            />
            <input
              value={editPrice}
              onChange={e => setEditPrice(e.target.value)}
              placeholder="Price (optional)"
              type="number"
              className="input mb-3"
            />

            {/* Category */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setEditCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${
                    editCategory === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 border border-white/10 py-3 rounded-xl text-sm text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateWish}
                disabled={!editTitle.trim() || updateMutation.isPending}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Delete button */}
            <button
              onClick={() => {
                if (confirm('Delete this wish?')) {
                  deleteMutation.mutate(selectedWish.id)
                }
              }}
              disabled={deleteMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash size={16} />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Wish'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
