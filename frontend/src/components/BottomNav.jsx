import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span>🏠</span>
        <span>Home</span>
        <div className="nav-dot"></div>
      </NavLink>
      <NavLink to="/insurance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span>🛡️</span>
        <span>Insurance</span>
        <div className="nav-dot"></div>
      </NavLink>
      <NavLink to="/claims" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span>📋</span>
        <span>Claims</span>
        <div className="nav-dot"></div>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span>👤</span>
        <span>Profile</span>
        <div className="nav-dot"></div>
      </NavLink>
    </nav>
  );
}
