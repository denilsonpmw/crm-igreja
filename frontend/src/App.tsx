import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MembersForm from './pages/MembersForm';
import CongregationsList from './pages/CongregationsList';
import CongregationsForm from './pages/CongregationsForm';
import RolesList from './pages/RolesList';
import RolesForm from './pages/RolesForm';
import ImportPage from './pages/Import';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MembersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/new"
              element={
                <ProtectedRoute>
                  <MembersForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id/edit"
              element={
                <ProtectedRoute>
                  <MembersForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/congregations"
              element={
                <ProtectedRoute>
                  <CongregationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/congregations/:id/edit"
              element={
                <ProtectedRoute>
                  <CongregationsForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute>
                  <RolesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/new"
              element={
                <ProtectedRoute>
                  <RolesForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/:id/edit"
              element={
                <ProtectedRoute>
                  <RolesForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/import"
              element={
                <ProtectedRoute>
                  <ImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
