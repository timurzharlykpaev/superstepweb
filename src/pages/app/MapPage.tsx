import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../../api/client'

interface WishItem {
  id: string
  title: string
  description?: string
  imageUrl?: string
  aiGeneratedImageUrl?: string
  category?: string
  status: string
}

export default function MapPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { data: wishes = [], isLoading } = useQuery({
    queryKey: ['wishes'],
    queryFn: async () => {
      const res = await client.get<WishItem[]>('/wish-items')
      return res.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      client.post('/wish-items', { title: newTitle, description: newDesc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishes'] })
      setShowModal(false)
      setNewTitle('')
      setNewDesc('')
    },
  })

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Vision Board</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your wish map & dreams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-4 py-2 rounded-xl text-sm"
        >
          + Add to Map
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-xl aspect-square animate-pulse" />
          ))}
        </div>
      ) : wishes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">🌟</span>
          <h3 className="text-white text-lg font-semibold mb-2">Your vision board is empty</h3>
          <p className="text-gray-500 text-sm mb-6">
            Add your dreams, wishes, and aspirations to visualize your future
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3 rounded-xl">
            Add First Wish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishes.map((wish) => (
            <div
              key={wish.id}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-square bg-[#242424] relative overflow-hidden">
                {wish.imageUrl || wish.aiGeneratedImageUrl ? (
                  <img
                    src={wish.aiGeneratedImageUrl || wish.imageUrl}
                    alt={wish.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl">✨</span>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {/* Title */}
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate">{wish.title}</p>
                {wish.description && (
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{wish.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">Add to Vision Board</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What do you wish for?"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your wish..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 py-3 rounded-xl hover:text-white transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={!newTitle.trim() || createMutation.isPending}
                  className="flex-1 btn-primary py-3 rounded-xl disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Wish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
