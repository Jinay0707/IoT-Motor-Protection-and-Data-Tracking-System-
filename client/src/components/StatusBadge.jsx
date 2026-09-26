import React from 'react';
import { ShieldCheck, AlertTriangle, ZapOff, Flame, Activity } from 'lucide-react';

export default function StatusBadge({ type, value }) {
  if (type === 'motor') {
    const isON = value === 'ON';
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm tracking-wide transition-all shadow-lg ${
          isON
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-green'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 glow-red'
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isON ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
        <Activity className="w-4 h-4" />
        <span>MOTOR STATUS: {isON ? 'RUNNING (ON)' : 'TRIPPED (OFF)'}</span>
      </div>
    );
  }

  // Fault badge
  const faultConfigs = {
    NORMAL: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      label: 'NORMAL OPERATION',
    },
    OVERHEAT: {
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      icon: Flame,
      label: 'HIGH TEMPERATURE FAULT',
    },
    OVERVOLTAGE: {
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: AlertTriangle,
      label: 'OVER-VOLTAGE FAULT',
    },
    UNDERVOLTAGE: {
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      icon: ZapOff,
      label: 'UNDER-VOLTAGE FAULT',
    },
    OVERCURRENT: {
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: AlertTriangle,
      label: 'OVER-CURRENT FAULT',
    },
  };

  const config = faultConfigs[value] || faultConfigs.NORMAL;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-semibold text-xs uppercase tracking-wider ${config.color}`}>
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
    </div>
  );
}
