import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Catalog from "./pages/Catalog.jsx";
import Module from "./pages/Module.jsx";
import Lesson from "./pages/Lesson.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import Workspace from "./pages/Workspace.jsx";
import Capstones from "./pages/Capstones.jsx";
import Projects from "./pages/Projects.jsx";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminLessons from "./pages/admin/AdminLessons.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminProjects from "./pages/admin/AdminProjects.jsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="content">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="track/:trackId" element={<Module />} />
        <Route path="quiz/:trackId" element={<QuizPage />} />
        <Route path="lesson/:lessonId" element={<Lesson />} />
        <Route path="capstones" element={<Capstones />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="workspace/:projectId" element={<Workspace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="profile" element={<Profile />} />
        <Route
          path="admin"
          element={
            <Protected admin>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="admin/users"
          element={
            <Protected admin>
              <AdminUsers />
            </Protected>
          }
        />
        <Route
          path="admin/content"
          element={
            <Protected admin>
              <AdminLessons />
            </Protected>
          }
        />
        <Route path="admin/projects" element={<Protected admin><AdminProjects /></Protected>} />
        <Route path="admin/analytics" element={<Protected admin><AdminAnalytics /></Protected>} />
        <Route path="admin/announcements" element={<Protected admin><AdminAnnouncements /></Protected>} />
        <Route path="admin/settings" element={<Protected admin><AdminSettings /></Protected>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
