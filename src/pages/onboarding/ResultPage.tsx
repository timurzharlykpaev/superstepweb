import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Target, CalendarBlank, FolderOpen, ChartBar, Palette, Check, Clock, PencilSimple } from '@phosphor-icons/react'
import { useVoiceOnboardingStore } from '../../store/voiceOnboardingStore'
import type { SubGoalDefinition } from '../../types/voice'

type FrequencyType = 'daily' | 'weekly' | 'monthly'

const FREQUENCY_OPTIONS: FrequencyType[] = ['daily', 'weekly', 'monthly']

const WEIGHT_OPTIONS = [1, 2, 3, 4, 5]

const COLOR_PALETTE = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#84CC16', // Lime
]

const DAYS_OF_WEEK = [
  { key: 0, short: 'S' },
  { key: 1, short: 'M' },
  { key: 2, short: 'T' },
  { key: 3, short: 'W' },
  { key: 4, short: 'T' },
  { key: 5, short: 'F' },
  { key: 6, short: 'S' },
]

export default function ResultPage() {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [editingSubGoalIndex, setEditingSubGoalIndex] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Temp state for editing
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFrequency, setEditFrequency] = useState<FrequencyType>('daily')
  const [editFrequencyValue, setEditFrequencyValue] = useState(1)
  const [editReminderTime, setEditReminderTime] = useState('09:00')
  const [editDaysOfWeek, setEditDaysOfWeek] = useState<number[]>([1, 3, 5])

  const {
    finalGoal,
    subGoals,
    motivationalMessage,
    updateFinalGoal,
    updateSubGoal,
    removeSubGoal,
    addSubGoal,
    confirmGoal,
    error,
    setError,
  } = useVoiceOnboardingStore()

  // Redirect if no final goal
  useEffect(() => {
    if (!finalGoal) {
      navigate('/onboarding/goal')
    }
  }, [finalGoal, navigate])

  const handleConfirm = useCallback(async () => {
    setIsCreating(true)
    setError(null)

    try {
      await confirmGoal()
      const currentStatus = useVoiceOnboardingStore.getState().status
      if (currentStatus === 'completed') {
        navigate('/onboarding/subscription')
      }
    } catch {
      // Error is shown from store
    } finally {
      setIsCreating(false)
    }
  }, [confirmGoal, navigate, setError])

  const openEditModal = (index: number) => {
    const subGoal = subGoals[index]
    setEditTitle(subGoal.title)
    setEditDescription(subGoal.description || '')
    setEditFrequency(subGoal.frequency)
    setEditFrequencyValue(subGoal.frequencyValue || 1)
    setEditReminderTime(subGoal.reminderTime || '09:00')
    setEditDaysOfWeek(subGoal.daysOfWeek || [1, 3, 5])
    setEditingSubGoalIndex(index)
  }

  const openAddModal = () => {
    setEditTitle('')
    setEditDescription('')
    setEditFrequency('daily')
    setEditFrequencyValue(1)
    setEditReminderTime('09:00')
    setEditDaysOfWeek([1, 3, 5])
    setShowAddModal(true)
  }

  const closeModal = () => {
    setEditingSubGoalIndex(null)
    setShowAddModal(false)
  }

  const saveSubGoal = () => {
    if (!editTitle.trim()) return

    const subGoalData: Partial<SubGoalDefinition> = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      frequency: editFrequency,
      frequencyValue: editFrequencyValue,
      reminderTime: editReminderTime,
      daysOfWeek: editFrequency === 'weekly' ? editDaysOfWeek : undefined,
    }

    if (editingSubGoalIndex !== null) {
      updateSubGoal(editingSubGoalIndex, subGoalData)
    } else if (showAddModal) {
      addSubGoal(subGoalData as SubGoalDefinition)
    }

    closeModal()
  }

  const toggleDayOfWeek = (day: number) => {
    setEditDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    )
  }

  const formatFrequency = (frequency: string, value?: number, daysOfWeek?: number[]) => {
    if (frequency === 'daily') return 'Daily'
    if (frequency === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        return `${daysOfWeek.length} days/week`
      }
      return `${value || 1}x/week`
    }
    if (frequency === 'monthly') return `${value || 1}x/month`
    return frequency
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isModalOpen = editingSubGoalIndex !== null || showAddModal

  if (!finalGoal) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}>
      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        {/* Header */}
        <div className="text-center mb-6">
          <Target size={48} className="mx-auto mb-3 text-purple-600" weight="duotone" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Your Plan is Ready!
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Review and customize your goal
          </p>
        </div>

        {/* Main Goal Card */}
        <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-4xl">{finalGoal.emoji || '🎯'}</span>
            <input
              type="text"
              value={finalGoal.title}
              onChange={(e) => updateFinalGoal({ title: e.target.value })}
              placeholder="Goal title"
              className="flex-1 text-lg font-semibold rounded-xl px-3 py-2 outline-none border border-transparent focus:border-purple-500/40 transition-colors"
              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Goal Details */}
          <div className="space-y-3">
            {finalGoal.description && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{finalGoal.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <CalendarBlank size={16} />
              <span>Deadline:</span>
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                {finalGoal.endDate ? formatDate(finalGoal.endDate) : 'No deadline'}
              </span>
            </div>

            {finalGoal.category && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <FolderOpen size={16} />
                <span>Category:</span>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{finalGoal.category}</span>
              </div>
            )}

            {/* Goal Size (Weight) */}
            <div className="pt-3">
              <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <ChartBar size={16} />
                <span>Goal size:</span>
              </div>
              <div className="flex gap-2">
                {WEIGHT_OPTIONS.map((w) => (
                  <button
                    key={w}
                    onClick={() => updateFinalGoal({ weight: w as 1 | 2 | 3 | 4 | 5 })}
                    className={`w-11 h-11 rounded-xl border-2 transition-all ${
                      finalGoal.weight === w
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    style={{ borderColor: finalGoal.weight === w ? finalGoal.color || '#8b5cf6' : undefined }}
                  >
                    <span className={`font-semibold ${finalGoal.weight === w ? 'text-purple-600 dark:text-purple-400' : ''}`} style={{ color: finalGoal.weight === w ? finalGoal.color || '#8b5cf6' : 'var(--color-text-muted)' }}>
                      {w}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal Color */}
            <div className="pt-3">
              <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Palette size={16} />
                <span>Color:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateFinalGoal({ color })}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      finalGoal.color === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {finalGoal.color === color && (
                      <Check size={16} weight="bold" className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-goals Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                Habits & Milestones
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Daily actions toward your goal
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl hover:bg-purple-700 transition-colors"
            >
              +
            </button>
          </div>

          <div className="space-y-3">
            {subGoals.map((subGoal, index) => (
              <button
                key={`subgoal-${index}`}
                onClick={() => openEditModal(index)}
                className="w-full flex items-center gap-3 rounded-xl p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{subGoal.title}</p>
                  {subGoal.description && (
                    <p className="text-sm mb-2 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{subGoal.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {formatFrequency(subGoal.frequency, subGoal.frequencyValue, subGoal.daysOfWeek)}
                    </span>
                    {subGoal.reminderTime && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={12} />
                        {subGoal.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
                <PencilSimple size={18} style={{ color: 'var(--color-text-muted)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        {motivationalMessage && (
          <div className="rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 mb-6">
            <p className="text-sm italic text-center" style={{ color: 'var(--color-text)' }}>
              "{motivationalMessage}"
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 border-t" style={{ borderColor: 'var(--color-surface)', backgroundColor: 'var(--color-background)' }}>
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-4">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`rounded-full ${i === 5 ? 'w-6 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-600'}`} />
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold py-4 rounded-xl transition-colors mb-2"
        >
          {isCreating ? 'Creating...' : 'Create Goal'}
          {!isCreating && <ArrowRight size={20} weight="bold" />}
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
          You can edit later in settings
        </p>
      </div>

      {/* Edit/Add SubGoal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-background)', maxHeight: '90vh' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-surface)' }}>
              <button onClick={closeModal} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Cancel
              </button>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                {showAddModal ? 'Add Habit' : 'Edit Habit'}
              </h3>
              <button
                onClick={saveSubGoal}
                disabled={!editTitle.trim()}
                className="text-sm font-semibold disabled:opacity-40"
                style={{ color: editTitle.trim() ? '#8b5cf6' : 'var(--color-text-muted)' }}
              >
                Save
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 60px)' }}>
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., Morning workout"
                  className="w-full rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Optional details..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-500 transition-colors resize-none"
                  style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Frequency</label>
                <div className="flex gap-2">
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setEditFrequency(freq)}
                      className={`flex-1 py-2 px-4 rounded-xl border-2 font-medium capitalize transition-all ${
                        editFrequency === freq
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      style={{ color: editFrequency !== freq ? 'var(--color-text-muted)' : undefined }}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days of Week (for weekly) */}
              {editFrequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Days of Week</label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.key}
                        onClick={() => toggleDayOfWeek(day.key)}
                        className={`w-10 h-10 rounded-full border-2 font-semibold transition-all ${
                          editDaysOfWeek.includes(day.key)
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        style={{ color: !editDaysOfWeek.includes(day.key) ? 'var(--color-text-muted)' : undefined }}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency Value (for weekly/monthly) */}
              {editFrequency !== 'daily' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Times per {editFrequency === 'weekly' ? 'week' : 'month'}
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setEditFrequencyValue(Math.max(1, editFrequencyValue - 1))}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 font-bold text-xl"
                      style={{ color: 'var(--color-text)' }}
                    >
                      −
                    </button>
                    <span className="text-3xl font-bold min-w-[60px] text-center" style={{ color: 'var(--color-text)' }}>
                      {editFrequencyValue}
                    </span>
                    <button
                      onClick={() => setEditFrequencyValue(Math.min(30, editFrequencyValue + 1))}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 font-bold text-xl"
                      style={{ color: 'var(--color-text)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Reminder Time */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Reminder Time</label>
                <input
                  type="time"
                  value={editReminderTime}
                  onChange={(e) => setEditReminderTime(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700 outline-none focus:border-purple-500 transition-colors"
                  style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Delete Button (only when editing) */}
              {editingSubGoalIndex !== null && (
                <button
                  onClick={() => {
                    removeSubGoal(editingSubGoalIndex)
                    closeModal()
                  }}
                  className="w-full py-3 text-red-600 dark:text-red-400 font-semibold"
                >
                  Delete Habit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
