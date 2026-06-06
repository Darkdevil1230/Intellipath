import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import authService from './services/authService';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Roadmap from './pages/Roadmap';
import Analytics from './pages/Analytics';
import Courses from './pages/Courses';
import Resources from './pages/Resources';
import Chat from './pages/Chat';
import Assessments from './pages/Assessments';
import AssessmentDetails from './pages/AssessmentDetails';
import Careers from './pages/Careers';
import Mentors from './pages/Mentors';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import { RoadmapProvider } from './context/RoadmapContext';

const queryClient = new QueryClient();

function App() {
  const { user, loading, token, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!loading) return;

      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user || data);
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [loading, token, setUser, setLoading, logout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              maxWidth: '420px',
            },
            success: {
              iconTheme: { primary: '#0284c7', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route
            path="/"
            element={
              user ? (
                user.onboardingCompleted ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/onboarding" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Authenticated Routes wrapped in Layout and RoadmapProvider */}
          <Route
            element={
              user ? (
                <RoadmapProvider>
                  <Layout />
                </RoadmapProvider>
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/roadmap/:id" element={<Roadmap />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/assessments/:id" element={<AssessmentDetails />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
          <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
