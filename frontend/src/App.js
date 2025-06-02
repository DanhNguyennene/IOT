import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./homepage";
import LoginPage from "./login";
import DashboardPage from "./dashboard";
import VoiceControlPage from "./voice_control";
import StatisticsPage from "./statistics";
import DevicesPage from "./devices";
import FamilyMembersPage from "./family_members";
import SettingPage from "./setting";
import { AuthProvider, useAuth } from "./AuthContext";
import SignupPage from "./signup";
// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<DashboardPage />} />
          <Route path="/signup" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/family_members" element={<FamilyMembersPage />} />
          <Route path="/voice_control" element={<VoiceControlPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/setting" element={<SettingPage />} />
          <Route path="/about" element={<div>About Page (Placeholder)</div>} />
        </Routes>
      </Router>
    </AuthProvider>

  );
}

export default App;
