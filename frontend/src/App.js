// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// import React from 'react';
// import SmartHomeLanding from './homepage';

// function App() {
//   return (
//     <div>
//       <SmartHomeLanding />
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './homepage';
import LoginPage from './login';
import DashboardPage from './dashboard';
import VoiceControlPage from './voice_control';
import StatisticsPage from './statistics';
import DevicesPage from './devices';
import FamilyMembersPage from './family_members';
import SettingPage from './setting';
import { AuthProvider, useAuth } from './AuthContext';
import SignupPage from './signup';
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <DevicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/family_members"
            element={
              <ProtectedRoute>
                <FamilyMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice_control"
            element={
              <ProtectedRoute>
                <VoiceControlPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute>
                <SettingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<div>About Page (Placeholder)</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
