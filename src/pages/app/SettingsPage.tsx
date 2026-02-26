import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Crown, Globe, Lock, SignOut,
  PencilSimple, Check, X, ArrowRight
} from '@phosphor-icons/react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { getSubscription } from '../../api/subscriptions'
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n'
import client from '../../api/client'
import ThemeToggle from '../../components/ThemeToggle'

const EMOJI_AVATARS = [
  '🦊','🐶','🐱','🦁','🐻','🐼','🐨','🐯','🦄','🐸',
  '🐵','🦉','🐲','🌟','🔥','🌈','🎯','🚀','💎','🎨',
]

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { theme } = useThemeStore()

  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameValue, setNicknameValue] = useState(user?.nickname || '')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('language') || 'en')

  const { data: sub } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await getSubscription()
      return res.data
    },
  })

  const updateNicknameMutation = useMutation({
    mutationFn: (nickname: string) => client.patch('/auth/me', { nickname }),
    onSuccess: () => {
      useAuthStore.setState(s => ({
        user: s.user ? { ...s.user, nickname: nicknameValue } : null,
      }))
      setEditingNickname(false)
    },
  })

  const updateAvatarMutation = useMutation({
    mutationFn: (emoji: string) => client.patch('/auth/me', { avatarUrl: `emoji:${emoji}` }),
    onSuccess: (_, emoji) => {
      useAuthStore.setState(s => ({
        user: s.user ? { ...s.user, avatarUrl: `emoji:${emoji}` } : null,
      }))
      setShowEmojiPicker(false)
    },
  })

  const handleLangSelect = (code: string) => {
    changeLanguage(code as any)
    setCurrentLang(code)
    setShowLangPicker(false)
  }

  const handleLogout = () => {
    if (confirm('Sign out?')) logout()
  }

  const avatarEmoji = user?.avatarUrl?.startsWith('emoji:') ? user.avatarUrl.slice(6) : null
  const isPro = sub?.status === 'active' || sub?.status === 'trialing'
  const langName = SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeName || currentLang

  const settingRow = (
    icon: React.ReactNode,
    label: string,
    value?: string,
    onClick?: () => void,
    danger = false
  ) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-left"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        danger ? 'bg-red-500/10' : 'bg-purple-500/10'
      }`}>
        <span className={danger ? 'text-red-400' : 'text-purple-400'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : ''}`} style={!danger ? { color: 'var(--color-text)' } : {}}>
          {label}
        </p>
        {value && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{value}</p>}
      </div>
      <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
    </button>
  )

  return (
    <div className="min-h-full p-4 md:p-6 pb-24 md:pb-6 space-y-4" style={{ backgroundColor: 'var(--color-background)' }}>
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Settings</h1>

      {/* Profile card */}
      <div className="rounded-2xl p-4 border border-black/5 dark:border-white/5" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 border-purple-500/30 hover:border-purple-500 transition-colors flex-shrink-0"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            {avatarEmoji || '👤'}
          </button>
          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  value={nicknameValue}
                  onChange={e => setNicknameValue(e.target.value)}
                  className="input flex-1 text-sm py-2"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && updateNicknameMutation.mutate(nicknameValue)}
                />
                <button onClick={() => updateNicknameMutation.mutate(nicknameValue)} className="text-green-400"><Check size={18} /></button>
                <button onClick={() => setEditingNickname(false)} className="text-gray-400"><X size={18} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg truncate" style={{ color: 'var(--color-text)' }}>
                  {user?.nickname || 'User'}
                </p>
                <button onClick={() => setEditingNickname(true)} className="text-gray-400 hover:text-purple-400 transition-colors">
                  <PencilSimple size={16} />
                </button>
              </div>
            )}
            <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
          </div>
        </div>

        {/* Subscription badge */}
        <div className={`flex items-center gap-2 p-3 rounded-xl ${isPro ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-white/5 border border-white/10'}`}>
          <Crown size={16} weight="fill" className={isPro ? 'text-yellow-400' : 'text-gray-400'} />
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {isPro ? `Pro${sub?.plan?.name ? ` (${sub.plan.name})` : ''}` : 'Free Plan'}
            </p>
            {sub?.currentPeriodEnd && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Expires {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          {!isPro && (
            <button className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium">
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-1">
        <p className="text-xs font-semibold px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>APPEARANCE</p>
        <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 text-lg">{theme === 'dark' ? '🌙' : '☀️'}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Language */}
      <div className="space-y-1">
        <p className="text-xs font-semibold px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>PREFERENCES</p>
        {settingRow(<Globe size={18} />, 'Language', langName, () => setShowLangPicker(true))}
      </div>

      {/* Account */}
      <div className="space-y-1">
        <p className="text-xs font-semibold px-1 mb-2" style={{ color: 'var(--color-text-muted)' }}>ACCOUNT</p>
        {settingRow(<Lock size={18} />, 'Privacy Policy', undefined, () => window.open('/privacy'))}
        {settingRow(<SignOut size={18} />, 'Sign Out', undefined, handleLogout, true)}
      </div>

      {/* Emoji picker modal */}
      {showEmojiPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Choose Avatar</h3>
              <button onClick={() => setShowEmojiPicker(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => updateAvatarMutation.mutate(emoji)}
                  className={`text-3xl p-2 rounded-xl hover:bg-purple-500/20 transition-colors ${
                    avatarEmoji === emoji ? 'bg-purple-500/20 ring-2 ring-purple-500' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language picker modal */}
      {showLangPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>Language</h3>
              <button onClick={() => setShowLangPicker(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-1">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangSelect(lang.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    currentLang === lang.code ? 'bg-purple-600' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm font-medium" style={{ color: currentLang === lang.code ? 'white' : 'var(--color-text)' }}>
                    {lang.nativeName}
                  </span>
                  {currentLang === lang.code && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
