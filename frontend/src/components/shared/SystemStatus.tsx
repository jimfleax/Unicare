import React, { useEffect, useState } from 'react';
import { checkHealthApi } from '../../services/api';
// The plan mentions lucide-react but it's not actually used in the snippet it gave (it just imported Activity).
// I will include it if needed or just use what the plan gave exactly.

export function SystemStatus() {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkHealthApi();
      setIsHealthy(status);
    };

    checkStatus();
    // Poll every 60 seconds
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--txt-muted)' }}>
      <div 
        style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: isHealthy ? '#22c55e' : '#ef4444',
          boxShadow: isHealthy ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)'
        }} 
      />
      <span>{isHealthy ? 'System Operational' : 'System Offline'}</span>
    </div>
  );
}
