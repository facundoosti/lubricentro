import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const ALERT_CONFIG = {
  error: {
    icon: AlertCircle,
    classes: 'bg-error-container/60 text-on-error-container border-error/30',
    iconClass: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-warning-500/10 text-warning-500 border-warning-500/30',
    iconClass: 'text-warning-500',
  },
  info: {
    icon: Info,
    classes: 'bg-primary-container/10 text-primary border-primary/20',
    iconClass: 'text-primary',
  },
};

const DashboardAlerts = ({ alerts = [] }) => {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = alerts.filter((_, i) => !dismissed.has(i));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((alert, i) => {
        if (dismissed.has(i)) return null;
        const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium flex-shrink-0 ${cfg.classes}`}
          >
            <Icon size={13} className={cfg.iconClass} />
            <span>{alert.message}</span>
            <button
              onClick={() => setDismissed(prev => new Set([...prev, i]))}
              className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardAlerts;
