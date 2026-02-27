import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'

const SLIDES = [
  {
    image: '/onboarding-showcase-goals.png',
    bg: 'from-violet-600/20 to-purple-600/10',
    title: 'Set Your Goal',
    subtitle: 'Tell us your dream in your own words. AI creates a smart, actionable plan tailored just for you.',
  },
  {
    image: '/onboarding-showcase-track.png',
    bg: 'from-blue-600/20 to-cyan-600/10',
    title: 'Weekly Planning',
    subtitle: 'Break your goal into weekly milestones and daily tasks that fit perfectly into your schedule.',
  },
  {
    image: '/onboarding-showcase-ai.png',
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
    <div
      className="flex flex-col"
      style={{ height: '100dvh', backgroundColor: 'var(--color-background)' }}
    >
      {/* Skip */}
      <div className="flex justify-end px-4 pt-4 flex-shrink-0">
        <button
          onClick={() => navigate('/onboarding/goal')}
          className="text-sm px-4 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Skip
        </button>
      </div>

      {/* Slide — занимает всё оставшееся место */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0">
        <div className="w-full max-w-sm text-center">
          <img
            src={current.image}
            alt={current.title}
            className="w-56 h-44 object-contain mx-auto mb-6 drop-shadow-2xl"
          />
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            {current.title}
          </h1>
          <p className="text-base leading-relaxed px-2" style={{ color: 'var(--color-text-muted)' }}>
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom — всегда прижат к низу */}
      <div className="flex-shrink-0 px-6 pb-8 pt-4 max-w-md mx-auto w-full">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-5">
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
