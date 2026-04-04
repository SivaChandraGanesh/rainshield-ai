import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setTime(`${h12}:${m} ${ampm}`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="phone-status-bar">
      <span className="status-time">{time}</span>
      <div className="status-notch"></div>
      <div className="status-icons">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 3.6C9.8 3.6 11.4 4.3 12.6 5.5L14 4.1C12.4 2.5 10.3 1.6 8 1.6C5.7 1.6 3.6 2.5 2 4.1L3.4 5.5C4.6 4.3 6.2 3.6 8 3.6Z"/>
          <path d="M8 6.8C9.1 6.8 10 7.2 10.8 7.9L12.2 6.5C11.1 5.4 9.6 4.8 8 4.8C6.4 4.8 4.9 5.4 3.8 6.5L5.2 7.9C6 7.2 6.9 6.8 8 6.8Z"/>
          <circle cx="8" cy="10.5" r="1.5"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <rect x="1" y="6" width="2.5" height="5" rx="0.5"/>
          <rect x="4.5" y="4" width="2.5" height="7" rx="0.5"/>
          <rect x="8" y="2" width="2.5" height="9" rx="0.5"/>
          <rect x="11.5" y="0" width="2.5" height="11" rx="0.5"/>
        </svg>
        <div className="status-battery">
          <div className="battery-body">
            <div className="battery-fill"></div>
          </div>
          <div className="battery-tip"></div>
        </div>
      </div>
    </div>
  );
}
