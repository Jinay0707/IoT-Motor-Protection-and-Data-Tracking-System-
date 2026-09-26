import React from 'react';

export default function MetricCard({ title, value, unit, icon: Icon, colorTheme, thresholdText, status }) {
  const themes = {
    orange: {
      border: 'border-orange-500/20 hover:border-orange-500/40',
      bg: 'bg-orange-500/5',
      iconBg: 'bg-orange-500/20 text-orange-400',
      text: 'text-orange-400',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      bg: 'bg-blue-500/5',
      iconBg: 'bg-blue-500/20 text-blue-400',
      text: 'text-blue-400',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      bg: 'bg-purple-500/5',
      iconBg: 'bg-purple-500/20 text-purple-400',
      text: 'text-purple-400',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400',
    },
  };

  const theme = themes[colorTheme] || themes.blue;

  return (
    <div className={`p-5 rounded-2xl bg-gray-900/60 backdrop-blur-md border ${theme.border} transition-all duration-300 shadow-xl flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold tracking-tight text-white">{value !== undefined ? value : '--'}</span>
          <span className={`text-lg font-bold ${theme.text}`}>{unit}</span>
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
        <span className="text-gray-500">{thresholdText}</span>
        {status && (
          <span className={`font-semibold px-2 py-0.5 rounded ${status.isOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {status.text}
          </span>
        )}
      </div>
    </div>
  );
}
