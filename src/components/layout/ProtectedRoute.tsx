import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useOnboardingStore } from '../../store/onboardingStore'

interface Props {
  children?: React.ReactNode
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ children, requireOnboarding }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isCompleted = useOnboardingStore((s) => s.isCompleted)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireOnboarding && !isCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
