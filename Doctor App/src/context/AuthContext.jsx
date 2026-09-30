import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'doctor' | 'patient' | null
  const [token, setToken] = useState(() => localStorage.getItem('doccare_auth_token') || null);
  
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load active session and doctors on mount
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Fetch public doctors list
      const docRes = await api.getDoctors().catch(() => ({ doctors: [] }));
      const docsList = docRes?.doctors || [];
      setDoctors(docsList);

      const savedToken = localStorage.getItem('doccare_auth_token');
      if (savedToken) {
        try {
          const meRes = await api.getMe();
          if (meRes?.authenticated && meRes?.user) {
            setUser(meRes.user);
            setRole(meRes.user.role);
            if (meRes.user.role === 'doctor') {
              const matchedDoc = meRes.doctor || docsList.find(d => d.id === meRes.user.doctorId) || docsList[0];
              setCurrentDoctor(matchedDoc);
              localStorage.setItem('doccare_active_doctor_id', matchedDoc?.id || 'doc-1');
            } else if (meRes.user.role === 'patient') {
              setCurrentPatient(meRes.patient || { id: meRes.user.patientId, name: meRes.user.name, email: meRes.user.email });
            }
          } else {
            // Token expired or invalid
            handleLogout(false);
          }
        } catch {
          // Token verification error
          handleLogout(false);
        }
      } else {
        // Unauthenticated initial state (user can browse publicly or log in)
        setUser(null);
        setRole(null);
        if (docsList.length > 0) {
          const savedDocId = localStorage.getItem('doccare_active_doctor_id');
          const defaultDoc = docsList.find(d => d.id === savedDocId) || docsList[0];
          setCurrentDoctor(defaultDoc);
        }
      }
    } catch (err) {
      console.error("Auth initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Login handler
  const login = async ({ identifier, password, role }) => {
    try {
      const res = await api.login({ identifier, password, role });
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('doccare_auth_token', res.token);
        setUser(res.user);
        setRole(res.user.role);

        if (res.user.role === 'doctor') {
          const matchedDoc = res.doctor || doctors.find(d => d.id === res.user.doctorId) || doctors[0];
          setCurrentDoctor(matchedDoc);
          localStorage.setItem('doccare_active_doctor_id', matchedDoc?.id || 'doc-1');
        } else {
          setCurrentPatient(res.patient || { id: res.user.patientId, name: res.user.name, email: res.user.email });
        }
        return { success: true, user: res.user, role: res.user.role };
      }
      return { success: false, error: res.error || "Login failed" };
    } catch (err) {
      return { success: false, error: err.message || "Invalid credentials" };
    }
  };

  // Registration handler
  const register = async (data) => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('doccare_auth_token', res.token);
        setUser(res.user);
        setRole(res.user.role);

        if (res.user.role === 'doctor') {
          const docRes = await api.getDoctors();
          if (docRes?.doctors) setDoctors(docRes.doctors);
          setCurrentDoctor(res.doctor);
          localStorage.setItem('doccare_active_doctor_id', res.doctor?.id || 'doc-1');
        } else {
          setCurrentPatient(res.patient);
        }
        return { success: true, user: res.user, role: res.user.role };
      }
      return { success: false, error: res.error || "Registration failed" };
    } catch (err) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  // Google OAuth handler
  const loginWithGoogle = async (googlePayload) => {
    try {
      const res = await api.googleAuth(googlePayload);
      if (res.success && res.token) {
        setToken(res.token);
        localStorage.setItem('doccare_auth_token', res.token);
        setUser(res.user);
        setRole(res.user.role);

        if (res.user.role === 'doctor') {
          const docRes = await api.getDoctors();
          if (docRes?.doctors) setDoctors(docRes.doctors);
          setCurrentDoctor(res.doctor);
          localStorage.setItem('doccare_active_doctor_id', res.doctor?.id || 'doc-1');
        } else {
          setCurrentPatient(res.patient);
        }
        return { success: true, user: res.user, role: res.user.role };
      }
      return { success: false, error: res.error || "Google authentication failed" };
    } catch (err) {
      return { success: false, error: err.message || "Google authentication failed" };
    }
  };

  // Forgot password request
  const forgotPassword = async ({ email, role }) => {
    try {
      const res = await api.forgotPassword({ email, role });
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset password
  const resetPassword = async ({ token, newPassword }) => {
    try {
      const res = await api.resetPassword({ token, newPassword });
      return res;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const handleLogout = (callApi = true) => {
    if (callApi && token) {
      api.logout().catch(() => {});
    }
    localStorage.removeItem('doccare_auth_token');
    setToken(null);
    setUser(null);
    setRole(null);
    setCurrentPatient(null);
  };

  const switchDoctor = (doctorId) => {
    const doc = doctors.find(d => d.id === doctorId);
    if (doc) {
      setCurrentDoctor(doc);
      localStorage.setItem('doccare_active_doctor_id', doc.id);
    }
  };

  const updateCurrentDoctor = async (updates) => {
    if (!currentDoctor) return;
    try {
      const res = await api.updateDoctor(currentDoctor.id, updates);
      if (res.success) {
        setCurrentDoctor(res.doctor);
        setDoctors(prev => prev.map(d => d.id === res.doctor.id ? res.doctor : d));
        return { success: true };
      }
    } catch (err) {
      console.error("Failed to update doctor profile:", err);
      return { success: false, error: err.message };
    }
  };

  const updateCurrentPatient = async (updates) => {
    try {
      const res = await api.updatePatientProfile(updates);
      if (res.success) {
        setCurrentPatient(res.patient);
        return { success: true, patient: res.patient };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      token,
      isAuthenticated: Boolean(user && token),
      isDoctor: Boolean(user && role === 'doctor'),
      isPatient: Boolean(user && role === 'patient'),
      doctors,
      currentDoctor,
      currentPatient,
      setCurrentDoctor,
      setCurrentPatient,
      switchDoctor,
      updateCurrentDoctor,
      updateCurrentPatient,
      login,
      register,
      loginWithGoogle,
      forgotPassword,
      resetPassword,
      logout: handleLogout,
      loading,
      refreshDoctors: initializeAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

