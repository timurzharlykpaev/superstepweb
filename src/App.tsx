import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import TodayPage from './pages/app/TodayPage'
import ChatPage from './pages/app/ChatPage'
import GoalsPage from './pages/app/GoalsPage'
import MapPage from './pages/app/MapPage'
import SettingsPage from './pages/app/SettingsPage'
import LanguagePage from './pages/onboarding/LanguagePage'
import ShowcasePage from './pages/onboarding/ShowcasePage'
import GoalPage from './pages/onboarding/GoalPage'
import ProcessingPage from './pages/onboarding/ProcessingPage'
import ResultPage from './pages/onboarding/ResultPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Onboarding — requires auth */}
      <Route path="/onboarding" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/onboarding/language" replace />} />
        <Route path="language" element={<LanguagePage />} />
        <Route path="showcase" element={<ShowcasePage />} />
        <Route path="goal" element={<GoalPage />} />
        <Route path="processing" element={<ProcessingPage />} />
        <Route path="result" element={<ResultPage />} />
      </Route>

      {/* Main app — requires auth + completed onboarding */}
      <Route
        path="/app"
        element={
          <ProtectedRoute requireOnboarding>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
