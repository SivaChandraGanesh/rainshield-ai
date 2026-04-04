import { useNavigate } from 'react-router-dom';

export default function TopBar({ showBack, showNotif }) {
  const navigate = useNavigate();

  return (
    <div className="top-bar">
      <div className="logo">
        <span className="logo-icon">🌧️</span> RainShield AI
      </div>
      {showNotif && (
        <button className="top-bar-action" title="Notifications">🔔</button>
      )}
      {showBack && (
        <button className="top-bar-action" onClick={() => navigate(-1)}>✕</button>
      )}
    </div>
  );
}
