import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { sendOtp, verifyOtp, googleSignIn } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { useOnboardingStore } from '../../store/onboardingStore'
import ThemeToggle from '../../components/ThemeToggle'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isOnboardingCompleted = useOnboardingStore((s) => s.isCompleted)

  const redirectAfterLogin = () => {
    navigate(isOnboardingCompleted ? '/app/today' : '/onboarding')
  }

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendOtp(email)
      setStep('otp')
    } catch {
      setError('Failed to send code. Please check your email and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await verifyOtp(email, code)
      const { accessToken, refreshToken, user } = res.data
      login({ accessToken, refreshToken }, user)
      redirectAfterLogin()
    } catch {
      setError('Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (idToken: string) => {
    setError('')
    setGoogleLoading(true)
    try {
      const res = await googleSignIn(idToken)
      const { accessToken, refreshToken, user } = res.data
      login({ accessToken, refreshToken }, user)
      redirectAfterLogin()
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }



  return (
    <div className="flex flex-col  flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/icon.png" alt="StepToGoal" className="w-16 h-16 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-white">StepToGoal</h1>
          <p className="text-gray-400 mt-1">Your goals deserve a plan</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-black/5 dark:border-white/5 p-8" style={{ backgroundColor: 'var(--color-surface)' }}>
          {step === 'email' ? (
            <>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Welcome back</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue your journey</p>

              {/* Google Sign-In */}
              <div className="mb-4">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleSuccess(credentialResponse.credential)
                    }
                  }}
                  onError={() => setError('Google sign-in was cancelled or failed.')}
                  width="100%"
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-xs">or continue with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="input"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm mb-6">
                We sent a 6-digit code to <span className="text-purple-400">{email}</span>
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="input text-center text-2xl tracking-widest"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn-primary w-full py-3 rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setCode(''); setError('') }}
                  className="text-gray-400 hover:text-white text-sm w-full text-center transition-colors"
                >
                  ← Back to email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
