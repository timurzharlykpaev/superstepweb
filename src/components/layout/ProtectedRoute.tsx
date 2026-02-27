import { Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useOnboardingStore } from '../../store/onboardingStore'
import api from '../../api/client'

interface Props {
  children?: React.ReactNode
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children, requireOnboarding }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCompleted = useOnboardingStore((s) => s.isCompleted)
  const setCompleted = useOnboardingStore((s) => s.setCompleted)
  // Only check backend once on first mount if not yet completed
  const [serverChecked, setServerChecked] = useState(false)

  useEffect(() => {
    if (!requireOnboarding || isCompleted || serverChecked) return
    api.get('/onboarding/status')
      .then((res) => { if (res.data?.completed) setCompleted(true) })
      .catch(() => {})
      .finally(() => setServerChecked(true))
  }, [requireOnboarding, isCompleted, serverChecked, setCompleted])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If needs onboarding check: wait for server response only if not already completed
  if (requireOnboarding && !isCompleted && !serverChecked) return null

  if (requireOnboarding && !isCompleted) return <Navigate to="/onboarding" replace />

  return children ? <>{children}</> : <Outlet />
}
