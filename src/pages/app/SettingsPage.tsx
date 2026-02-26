import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getSubscription, createCheckout } from '../../api/subscriptions'
import { SUPPORTED_LANGUAGES, changeLanguage, type LanguageCode } from '../../i18n'
import i18n from '../../i18n'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => getSubscription().then((r) => r.data),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    try {
      const res = await createCheckout(plan)
      window.open(res.data.checkoutUrl, '_blank')
    } catch {
      alert('Unable to open checkout. Please try again.')
    }
  }

  const currentLang = i18n.language as LanguageCode

  return (
    <div className="min-h-full bg-[#0D0D0D] p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Profile */}
      <section className="bg-[#1a1a1a] rounded-xl border border-white/5 mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Profile</h2>
        </div>
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center text-xl">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <p className="text-white font-medium">{user?.nickname || 'User'}</p>
            <p className="text-gray-500 text-sm">{user?.email || '—'}</p>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="bg-[#1a1a1a] rounded-xl border border-white/5 mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Subscription</h2>
        </div>
        <div className="px-5 py-4">
          {subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium capitalize">
                  {subscription.plan?.name || 'Free'} Plan
                </p>
                <p className="text-gray-500 text-sm capitalize">{subscription.status}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-gray-600 text-xs mt-0.5">
                    Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              {(!subscription.plan || subscription.plan.code === 'free') && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpgrade('monthly')}
                    className="btn-secondary text-sm px-3 py-2 rounded-lg"
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => handleUpgrade('yearly')}
                    className="btn-primary text-sm px-3 py-2 rounded-lg"
                  >
                    Yearly
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Free Plan</p>
                <p className="text-gray-500 text-sm">Upgrade to unlock all features</p>
              </div>
              <button
                onClick={() => handleUpgrade('yearly')}
                className="btn-primary text-sm px-4 py-2 rounded-lg"
              >
                Upgrade
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Language */}
      <section className="bg-[#1a1a1a] rounded-xl border border-white/5 mb-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Language</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code as LanguageCode)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                currentLang === lang.code
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-3 rounded-xl transition-colors font-medium"
      >
        Sign Out
      </button>
    </div>
  )
}
