import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  CalendarDots, CheckSquare, ChartBar, Robot,
  Star, Crosshair, Microphone, Globe,
  Lightning,
} from '@phosphor-icons/react'
import ThemeToggle from '../components/ThemeToggle'
import { LS_STORE_URL, LS_VARIANT_MONTHLY, LS_VARIANT_YEARLY } from '../constants/config'

const IOS_URL = 'https://apps.apple.com/app/steptogoal/id6741838195'
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=io.steptogoal.mobile'

function usePlatform() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  const isMobile = isIOS || /android/i.test(ua)
  return { isIOS, isMobile }
}

function MobileAppBanner() {
  const { isIOS, isMobile } = usePlatform()
  const [dismissed, setDismissed] = useState(() => !!sessionStorage.getItem('bannerDismissed'))

  if (!isMobile || dismissed) return null

  const storeUrl = isIOS ? IOS_URL : ANDROID_URL
  const storeLabel = isIOS ? '⬇ App Store' : '⬇ Google Play'

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
      <img src="/icon.png" alt="StepToGoal" className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gray-900 dark:text-white">StepToGoal</div>
        <div className="text-xs text-gray-500">Achieve your goals step by step</div>
      </div>
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
      >
        {storeLabel}
      </a>
      <button
        onClick={() => { setDismissed(true); sessionStorage.setItem('bannerDismissed', '1') }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
      >
        ×
      </button>
    </div>
  )
}

function StoreButtons({ className = '' }: { className?: string }) {
  const { isMobile } = usePlatform()
  if (isMobile) return null // on mobile we only show the web app CTA + banner
  return (
    <div className={`flex gap-3 ${className}`}>
      <a href={IOS_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        App Store
      </a>
      <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.523 15.341 20 10.5l-2.477-4.841A1 1 0 0 0 16.6 5H7.4a1 1 0 0 0-.923.659L4 10.5l2.477 4.841A1 1 0 0 0 7.4 16h9.2a1 1 0 0 0 .923-.659zM8.5 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>
        Google Play
      </a>
    </div>
  )
}

const features = [
  {
    Icon: CalendarDots,
    title: 'Smart Planning',
    desc: 'Break down goals into weekly milestones and daily tasks. AI creates plans based on your schedule.',
    color: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    Icon: CheckSquare,
    title: 'Daily Tasks & Habits',
    desc: 'Get personalized daily tasks that move you closer to your goals. Track streaks and build lasting habits.',
    color: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    Icon: ChartBar,
    title: 'Progress Tracking',
    desc: 'Visualize your journey with beautiful charts and progress rings. Celebrate every milestone.',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    Icon: Robot,
    title: 'AI Coach',
    desc: 'Smart suggestions and motivation from your personal AI coach. Voice input, text chat, quick actions.',
    color: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/20',
    iconColor: 'text-orange-400',
  },
  {
    Icon: Star,
    title: 'Wish Map',
    desc: 'Visual vision board with AI-generated images. Radiate dreams around your avatar in a mind map.',
    color: 'from-pink-500/20 to-rose-500/10',
    border: 'border-pink-500/20',
    iconColor: 'text-pink-400',
  },
  {
    Icon: Crosshair,
    title: 'Goal Hierarchy',
    desc: 'Organize goals at global, monthly, and weekly levels. See how daily tasks connect to big dreams.',
    color: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    Icon: Microphone,
    title: 'Voice Input',
    desc: 'Create goals and wishes by simply speaking. AI transcribes and enhances your words into action plans.',
    color: 'from-red-500/20 to-rose-500/10',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    Icon: Globe,
    title: '9 Languages',
    desc: 'Available in English, Russian, Spanish, German, French, Portuguese, Chinese, Japanese & Korean.',
    color: 'from-teal-500/20 to-cyan-500/10',
    border: 'border-teal-500/20',
    iconColor: 'text-teal-400',
  },
]

const steps = [
  { n: '1', Icon: Microphone, title: 'Set Your Goal', desc: 'Tell us your dream — by voice or text. AI helps you define clear, achievable goals.' },
  { n: '2', Icon: CalendarDots, title: 'Get Your Plan', desc: 'AI breaks it down into monthly milestones and weekly tasks personalized to your pace.' },
  { n: '3', Icon: Lightning, title: 'Take Action', desc: 'Complete daily tasks, track your streaks, and watch your progress grow day by day.' },
]

export default function LandingPage() {
  const monthlyCheckout = `${LS_STORE_URL}/checkout/buy/${LS_VARIANT_MONTHLY}`
  const yearlyCheckout = `${LS_STORE_URL}/checkout/buy/${LS_VARIANT_YEARLY}`

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      <MobileAppBanner />
      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-green-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-black/5 dark:border-white/5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-background) 85%, transparent)' }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="StepToGoal" className="w-8 h-8 rounded-xl" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            StepToGoal
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="btn-primary px-4 py-2 rounded-lg text-sm">
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Now Available — Web App is Live 🚀
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Achieve Your Goals
            </span>
            <br />
            <span className="text-white">Step by Step</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your dreams into reality with smart weekly planning, AI-powered coaching,
            vision board, and beautiful progress tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              <Lightning size={20} weight="fill" />
              Open Web App
            </Link>

          </div>
          <StoreButtons className="justify-center mt-4" />

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 text-center">
            {[
              { val: '9', label: 'Languages' },
              { val: 'AI', label: 'Powered Coach' },
              { val: '∞', label: 'Goals' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-purple-400">{stat.val}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why StepToGoal?
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Everything you need to turn ambitions into achievements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ Icon, title, desc, color, border, iconColor }) => (
              <div
                key={title}
                className={`bg-gradient-to-br ${color} rounded-2xl p-6 border ${border} hover:scale-[1.02] transition-all duration-200 group cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 bg-black/20 rounded-xl mb-4 ${iconColor}`}>
                  <Icon size={24} weight="duotone" />
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-white/90 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Three simple steps to transform your life</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ n, Icon, title, desc }) => (
              <div key={n} className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 mx-auto">
                    <Icon size={28} weight="duotone" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full text-xs font-bold text-white flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Simple Pricing
              </span>
            </h2>
            <p className="text-gray-400 text-lg">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8">
              <h3 className="text-white text-2xl font-bold mb-2">Free</h3>
              <div className="text-5xl font-extrabold text-white mb-1">$0</div>
              <p className="text-gray-500 mb-6">forever</p>
              <ul className="space-y-3 mb-8">
                {['Up to 3 active goals', '5 AI coach messages / day', '3 wish map items', 'Basic planning & tasks', '9 languages'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckSquare size={18} weight="fill" className="text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block w-full text-center border border-white/20 hover:border-purple-500 text-gray-300 hover:text-purple-300 font-semibold py-3 rounded-xl transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-purple-900/40 to-[#1a1a1a] rounded-2xl border border-purple-500/40 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-extrabold text-white">$2.49</span>
                <span className="text-gray-400">/mo</span>
              </div>
              <p className="text-gray-500 mb-1">$29.99/year · Save 58%</p>
              <p className="text-gray-500 mb-6">or $5.99/month</p>
              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Everything in Free, plus:', header: true },
                  { text: 'Unlimited goals' },
                  { text: 'Unlimited AI coach' },
                  { text: 'Unlimited wish map' },
                  { text: 'Voice input & transcription' },
                  { text: 'AI image generation' },
                  { text: 'Advanced analytics' },
                  { text: 'Smart reminders' },
                ].map(({ text, header }) => (
                  <li key={text} className={`flex items-center gap-3 ${header ? 'text-gray-500 font-medium' : 'text-gray-300'}`}>
                    {!header && <CheckSquare size={18} weight="fill" className="text-purple-400 shrink-0" />}
                    {text}
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <a
                  href={yearlyCheckout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Start 7-Day Free Trial (Yearly)
                </a>
                <a
                  href={monthlyCheckout}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center border border-purple-500/40 hover:border-purple-500 text-purple-300 py-3 rounded-xl transition-colors text-sm"
                >
                  Monthly — $5.99/mo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-b from-purple-900/20 to-[#1a1a1a] rounded-2xl border border-purple-500/20 p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ready to Achieve Your Goals?
            </span>
          </h2>
          <p className="text-gray-400 mb-8">StepToGoal web app is live. Start for free — no download needed.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            <Lightning size={20} weight="fill" />
            Open Web App — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.png" alt="StepToGoal" className="w-7 h-7 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            StepToGoal
          </span>
        </div>
        <div className="flex items-center justify-center gap-6 text-gray-500 text-sm mb-4">
          <a href="mailto:support@steptogoal.io" className="hover:text-white transition-colors">Contact</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
        <p className="text-gray-600 text-sm">© 2026 Goalin LLP. Astana, Kazakhstan. All rights reserved.</p>
      </footer>
    </div>
  )
}
