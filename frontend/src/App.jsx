import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Toast from './components/Toast';
import StatusBar from './components/StatusBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InsurancePage from './pages/InsurancePage';
import ClaimsPage from './pages/ClaimsPage';
import ProfilePage from './pages/ProfilePage';
import PolicyTermsPage from './pages/PolicyTermsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import FinancialsPage from './pages/FinancialsPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div className="page-transition" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/insurance" element={<InsurancePage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/policy-terms" element={<PolicyTermsPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/financials" element={<FinancialsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="phone-shell">
          <StatusBar />
          <Toast />
          <AnimatedRoutes />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
