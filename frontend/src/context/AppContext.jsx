import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [weather, setWeather] = useState(null);
  const [claim, setClaim] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('medium');
  const [toast, setToast] = useState({ message: '', visible: false });

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('rainshield_user'));
      const storedPlan = JSON.parse(localStorage.getItem('rainshield_plan'));
      if (storedUser && storedPlan) {
        setUser(storedUser);
        setPlan(storedPlan);
        setSelectedPlanId(storedPlan.planId || 'medium');
      }
    } catch (_) { /* ignore */ }
  }, []);

  // Persist user and plan to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('rainshield_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (plan) localStorage.setItem('rainshield_plan', JSON.stringify(plan));
  }, [plan]);

  const showToast = useCallback((message, duration = 3000) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), duration);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rainshield_user');
    localStorage.removeItem('rainshield_plan');
    setUser(null);
    setPlan(null);
    setWeather(null);
    setClaim(null);
    setSelectedPlanId('medium');
    showToast('Logged out successfully.');
  }, [showToast]);

  const value = {
    user, setUser,
    plan, setPlan,
    weather, setWeather,
    claim, setClaim,
    selectedPlanId, setSelectedPlanId,
    toast, showToast,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
