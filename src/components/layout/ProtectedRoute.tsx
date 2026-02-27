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
  const [checking, setChecking] = useState(requireOnboarding && !isCompleted)

  useEffect(() => {
    if (!requireOnboarding || isCompleted) return
    // Sync with backend — in case localStorage is stale
    api.get('/onboarding/status').then((res) => {
      if (res.data?.completed) setCompleted(true)
    }).catch(() => {}).finally(() => setChecking(false))
  }, [requireOnboarding, isCompleted, setCompleted])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (checking) return null // brief flash while checking
  if (requireOnboarding && !isCompleted) return <Navigate to="/onboarding" replace />

  return children ? <>{children}</> : <Outlet />
}
