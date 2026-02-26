import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crosshair, CalendarDots, Lightning, ArrowRight } from '@phosphor-icons/react'

const SLIDES = [
  {
    icon: <Crosshair size={56} weight="duotone" className="text-violet-400" />,
    bg: 'from-violet-600/20 to-purple-600/10',
    title: 'Set Your Goal',
    subtitle: 'Tell us your dream in your own words. AI creates a smart, actionable plan tailored just for you.',
  },
  {
    icon: <CalendarDots size={56} weight="duotone" className="text-blue-400" />,
    bg: 'from-blue-600/20 to-cyan-600/10',
    title: 'Weekly Planning',
    subtitle: 'Break your goal into weekly milestones and daily tasks that fit perfectly into your schedule.',
  },
  {
    icon: <Lightning size={56} weight="duotone" className="text-amber-400" />,
    bg: 'from-amber-600/20 to-orange-600/10',
    title: 'Track & Achieve',
    subtitle: 'Complete daily tasks, track your streak, and celebrate every step forward on your journey.',
  },
]

export default function ShowcasePage() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)

  const isLast = slide === SLIDES.length - 1
  const current = SLIDES[slide]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate('/onboarding/goal')}
          className="text-sm px-4 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className={`bg-gradient-to-b ${current.bg} w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8`}>
            {current.icon}
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>{current.title}</h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{current.subtitle}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-6 max-w-md mx-auto w-full">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-6 h-2 bg-purple-500' : 'w-2 h-2 bg-gray-600'}`}
            />
          ))}
        </div>

        <button
          onClick={() => isLast ? navigate('/onboarding/goal') : setSlide(s => s + 1)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          {isLast ? 'Get Started' : 'Next'}
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </div>
  )
}
