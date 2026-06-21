import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import MentorProfilePage from "./pages/MentorProfilePage";
import SessionChat from "./pages/SessionChat";
import Sessions from "./pages/Sessions";
import LearnerCalendar from "./pages/LearnerCalendar";
import MentorCalendar from "./pages/MentorCalendar";
import Credits from "./pages/Credits";
import Reviews from "./pages/Reviews";
import Admin from "./pages/Admin";
import AdminDisputes from "./pages/AdminDisputes";
import MentorAvailability from "./pages/MentorAvailability";
import ChangePassword from "./pages/ChangePassword";
import NotificationsPage from "./pages/NotificationsPage";
import Community from "./pages/Community";
import CreateDoubt from "./pages/CreateDoubt";
import DoubtDetail from "./pages/DoubtDetail";
import NotFound from "./pages/NotFound";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function PrivateLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />

      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicLayout>
            <Signup />
          </PublicLayout>
        }
      />

      <Route
        path="/verify-email"
        element={
          <PublicLayout>
            <VerifyEmail />
          </PublicLayout>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicLayout>
            <ForgotPassword />
          </PublicLayout>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicLayout>
            <ResetPassword />
          </PublicLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateLayout>
            <Dashboard />
          </PrivateLayout>
        }
      />

      <Route
        path="/explore"
        element={
          <PrivateLayout>
            <Explore />
          </PrivateLayout>
        }
      />

      <Route
        path="/mentors/:id"
        element={
          <PrivateLayout>
            <MentorProfilePage />
          </PrivateLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateLayout>
            <Profile />
          </PrivateLayout>
        }
      />

      <Route
        path="/sessions"
        element={
          <PrivateLayout>
            <Sessions />
          </PrivateLayout>
        }
      />

      <Route
        path="/sessions/:id/chat"
        element={
          <PrivateLayout>
            <SessionChat />
          </PrivateLayout>
        }
      />

      <Route
        path="/credits"
        element={
          <PrivateLayout>
            <Credits />
          </PrivateLayout>
        }
      />

      <Route
        path="/reviews"
        element={
          <PrivateLayout>
            <Reviews />
          </PrivateLayout>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateLayout>
            <Admin />
          </PrivateLayout>
        }
      />

      <Route
        path="/availability"
        element={
          <PrivateLayout>
            <MentorAvailability />
          </PrivateLayout>
        }
      />

      <Route
        path="/learning-calendar"
        element={
          <PrivateLayout>
            <LearnerCalendar />
          </PrivateLayout>
        }
      />

      <Route
        path="/mentor-calendar"
        element={
          <PrivateLayout>
            <MentorCalendar />
          </PrivateLayout>
        }
      />

      <Route
        path="/admin/disputes"
        element={
          <PrivateLayout>
            <AdminDisputes />
          </PrivateLayout>
        }
      />

      <Route
        path="/change-password"
        element={
          <PrivateLayout>
            <ChangePassword />
          </PrivateLayout>
        }
      />

      <Route
        path="/notifications"
        element={
          <PrivateLayout>
            <NotificationsPage />
          </PrivateLayout>
        }
      />

      <Route
        path="/community"
        element={
          <PrivateLayout>
            <Community />
          </PrivateLayout>
        }
      />

      <Route
        path="/community/bookmarks"
        element={
          <PrivateLayout>
            <Community isBookmarksPage={true} />
          </PrivateLayout>
        }
      />

      <Route
        path="/community/create"
        element={
          <PrivateLayout>
            <CreateDoubt />
          </PrivateLayout>
        }
      />

      <Route
        path="/community/:id"
        element={
          <PrivateLayout>
            <DoubtDetail />
          </PrivateLayout>
        }
      />

      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
    </Routes>
    </>
  );
}

export default App;